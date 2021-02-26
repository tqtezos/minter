#include "../fa2/fa2_tzip16_interface.mligo"
#include "../fa2_modules/simple_admin.mligo"

type fa2_tokens =
  [@layout:comb]
  {
    token_id : token_id;
    amount : nat;
  }
type tokens =
  [@layout:comb]
  {
    fa2_address : address;
    fa2_batch : (fa2_tokens list);
  }

type auction =
  [@layout:comb]
  {
    current_bid : tez;
    start_time : timestamp;
    last_bid_time : timestamp;
    round_time : int;
    extend_time : int;
    asset : (tokens list);
    min_raise_percent : nat;
    end_time : timestamp;
    highest_bidder : address;
  }

type configure_param =
  [@layout:comb]
  {
    opening_price : tez;
    min_raise_percent : nat;
    round_time : nat;
    extend_time : nat;
    asset : (tokens list);
    start_time : timestamp;
    end_time : timestamp;
  }

type auction_entrypoints =
  | Configure of configure_param
  | Bid of nat
  | Cancel of nat
  | Resolve of nat
  | Admin of simple_admin

type storage =
  [@layout:comb]
  {
    simple_admin : simple_admin_storage;
    current_id : nat;
    max_auction_time : nat;
    max_config_to_start_time : nat;
    auctions : (nat, auction) big_map
  }

type return = operation list * storage

let assert_msg (condition, msg : bool * string ) : unit = 
  if (not condition) then failwith(msg) else unit

let address_to_contract_transfer_entrypoint(add : address) : ((transfer list) contract) =
  let c : (transfer list) contract option = Tezos.get_entrypoint_opt "%transfer" add in
  match c with
    None -> (failwith "Invalid FA2 Address" : (transfer list) contract)
  | Some c ->  c

let fa2_batch_to_transfer_param(fa2_batch, from_, to_ : fa2_tokens list * address * address) : (transfer list) =
  let to_tx (fa2_tokens : fa2_tokens) : transfer_destination = {
      to_ = to_;
      token_id = fa2_tokens.token_id;
      amount = fa2_tokens.amount;
  } in
  let txs = List.map to_tx fa2_batch in
  let transfer_param = {from_ = from_; txs = txs} in
  [transfer_param]

(*Transfers tokens in batch from a single FA2 contract*)
let tokens_to_operation(from_ : address) (to_ : address) (tokens : tokens): operation =
  let param = fa2_batch_to_transfer_param(tokens.fa2_batch, from_, to_) in
  let c = address_to_contract_transfer_entrypoint(tokens.fa2_address) in
  (Tezos.transaction param 0mutez c)

(*Handles transfers of tokens across FA2 Contracts*)
let tokens_to_operation_list((tokens_list, from_, to_) : tokens list * address * address) : (operation list) =
   (List.map (tokens_to_operation from_ to_) tokens_list)

let get_auction_data ((asset_id, storage) : nat * storage) : auction =
  match (Big_map.find_opt asset_id storage.auctions) with
      None -> (failwith "Auction does not exist for given asset_id" : auction)
    | Some auction -> auction

let resolve_contract (add : address) : unit contract =
  match ((Tezos.get_contract_opt add) : (unit contract) option) with
      None -> (failwith "Return address does not resolve to contract" : unit contract)
    | Some c -> c

let auction_ended (auction : auction) : bool =
  ((Tezos.now >= auction.end_time) || (* auction has passed auction time*)
   (Tezos.now > auction.last_bid_time + auction.round_time)) (*round time has passed after bid has been placed*)

let auction_started (auction : auction) : bool = 
  Tezos.now >= auction.start_time

let auction_in_progress (auction : auction) : bool = 
  auction_started(auction) && (not auction_ended(auction))

(*This condition is met iff no bid has been placed before the function executes*)
let first_bid (auction, storage : auction * storage) : bool =
  auction.highest_bidder = storage.simple_admin.admin

let valid_bid_amount (auction, storage : auction * storage) : bool =
  (Tezos.amount >= (auction.current_bid + ((auction.min_raise_percent *  auction.current_bid)/ 100n))) ||
  ((Tezos.amount >= auction.current_bid) && first_bid(auction, storage))

let configure_auction(configure_param, storage : configure_param * storage) : return = begin
    (fail_if_not_admin storage.simple_admin);
    (fail_if_paused storage.simple_admin);

    assert_msg (configure_param.end_time > configure_param.start_time, "end_time must be after start_time");
    assert_msg (abs(configure_param.end_time - configure_param.start_time) <= storage.max_auction_time, "Auction time must be less than max_auction_time");
    
    assert_msg (configure_param.start_time >= Tezos.now, "Start_time must not have already passed");
    assert_msg (abs(configure_param.start_time - Tezos.now) <= storage.max_config_to_start_time, "start_time must not be greater than the sum of current time and max_config_to_start_time");
    
    assert_msg (configure_param.opening_price > 0mutez, "Opening price must be greater than 0mutez");
    assert_msg (Tezos.amount = configure_param.opening_price, "Amount must be equal to opening_price");
    assert_msg (configure_param.round_time > 0n, "Round_time must be greater than 0 seconds");

    let auction_data : auction = {
      current_bid = configure_param.opening_price;
      start_time = configure_param.start_time;
      round_time = int(configure_param.round_time);
      extend_time = int(configure_param.extend_time);
      asset = configure_param.asset;
      min_raise_percent = configure_param.min_raise_percent;
      end_time = configure_param.end_time;
      highest_bidder = Tezos.sender;
      last_bid_time = configure_param.start_time; 
    } in
    let updated_auctions : (nat, auction) big_map = Big_map.update storage.current_id (Some auction_data) storage.auctions in
    let fa2_transfers : operation list = tokens_to_operation_list(configure_param.asset, Tezos.sender, Tezos.self_address) in
    (fa2_transfers, {storage with auctions = updated_auctions; current_id = storage.current_id + 1n})
  end

let resolve_auction(asset_id, storage : nat * storage) : return = begin
    let auction : auction = get_auction_data(asset_id, storage) in
    assert_msg (auction_ended(auction) , "Auction must have ended");
    assert_msg (Tezos.amount = 0mutez, "Amount must be 0mutez");
    (fail_if_paused storage.simple_admin);

    let fa2_transfers : operation list = tokens_to_operation_list(auction.asset, Tezos.self_address, auction.highest_bidder) in
    let seller_contract : unit contract = resolve_contract(storage.simple_admin.admin) in
    let send_fee = Tezos.transaction unit auction.current_bid seller_contract in
    let updated_auctions = Big_map.remove asset_id storage.auctions in
    (send_fee :: fa2_transfers, {storage with auctions = updated_auctions})
  end

let cancel_auction(asset_id, storage : nat * storage) : return = begin
    let auction : auction = get_auction_data(asset_id, storage) in
    (fail_if_not_admin storage.simple_admin);
    (fail_if_paused storage.simple_admin);
    assert_msg (not auction_ended(auction), "Auction must not have ended");
    assert_msg (Tezos.amount = 0mutez, "Amount must be 0mutez");

    let fa2_transfers : operation list = tokens_to_operation_list(auction.asset, Tezos.self_address, storage.simple_admin.admin) in
    let highest_bidder_contract : unit contract = resolve_contract(auction.highest_bidder) in
    let return_bid = Tezos.transaction unit auction.current_bid highest_bidder_contract in
    let updated_auctions = Big_map.remove asset_id storage.auctions in
    (return_bid :: fa2_transfers, {storage with auctions = updated_auctions})
  end

let place_bid(asset_id, storage : nat * storage) : return = begin
    let auction : auction = get_auction_data(asset_id, storage) in
    assert_msg (Tezos.sender = Tezos.source, "Bidder must be an implicit account");
    (fail_if_paused storage.simple_admin);
    assert_msg (auction_in_progress(auction), "Auction must be in progress");
    assert_msg (valid_bid_amount(auction, storage), "Bid must raised by at least min_raise_percent of the previous bid or at least opening price if it is the first bid");
    assert_msg(Tezos.sender <> storage.simple_admin.admin, "Admin cannot place a bid");

    let highest_bidder_contract : unit contract = resolve_contract(auction.highest_bidder) in
    let return_bid = Tezos.transaction unit auction.current_bid highest_bidder_contract in
    let new_end_time = if auction.end_time - Tezos.now <= auction.extend_time then 
      Tezos.now + auction.extend_time else auction.end_time in
    let updated_auction_data = {auction with current_bid = Tezos.amount; highest_bidder = Tezos.sender; last_bid_time = Tezos.now; end_time = new_end_time;} in
    let updated_auctions = Big_map.update asset_id (Some updated_auction_data) storage.auctions in
    ([return_bid] , {storage with auctions = updated_auctions})
  end

let admin(admin_param, storage : simple_admin * storage) : return = 
    let u = assert_msg (Tezos.amount = 0mutez, "Amount must be 0mutez") in
    let ops, simple_admin = simple_admin(admin_param, storage.simple_admin) in
    let new_storage = { storage with simple_admin = simple_admin; } in
    ops, new_storage

let english_auction_tez_main (p,storage : auction_entrypoints * storage) : return = match p with
    | Configure config -> configure_auction(config, storage)
    | Bid asset_id -> place_bid(asset_id, storage)
    | Cancel asset_id -> cancel_auction(asset_id, storage)
    | Resolve asset_id -> resolve_auction(asset_id, storage)
    | Admin a -> admin(a, storage)