#include "../fa2/fa2_tzip16_interface.mligo"

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
    seller : address;
    current_bid : tez;
    start_time : timestamp;
    last_bid_time : timestamp;
    round_time : int;
    asset : (tokens list);
    min_raise : tez;
    auction_time : int;
    highest_bidder : address;
  }

type configure_param =
  [@layout:comb]
  {
    opening_price : tez;
    min_raise : tez;
    round_time : nat;
    asset : (tokens list);
    auction_time : nat;
    start_time : timestamp;
  }

type auction_entrypoints =
  | Configure of configure_param
  | Bid of nat
  | Cancel of nat
  | Resolve of nat

type storage =
  [@layout:comb]
  {
    current_id : nat;
    max_auction_time : nat;
    max_config_to_start_time : nat;
    auctions : (nat, auction) big_map
  }

type return = operation list * storage

let address_to_contract_transfer_entrypoint(add : address) : ((transfer list) contract) =
  let c : (transfer list) contract option = Tezos.get_entrypoint_opt "%transfer" add in
  match c with
    None -> (failwith "Invalid FA2 Address" : (transfer list) contract)
  | Some c ->  c

let fa2_batch_to_transfer_list(fa2_batch, from_, to_ : fa2_tokens list * address * address) : (transfer list) =
  let to_tx (fa2_tokens : fa2_tokens) : transfer_destination = {
      to_ = to_;
      token_id = fa2_tokens.token_id;
      amount = fa2_tokens.amount;
  } in
  let txs = List.map to_tx fa2_batch in
  let transfer_param = {from_ = from_; txs = txs} in
  [transfer_param]

let tokens_to_operation(from_ : address) (to_ : address) (tokens : tokens): operation =
  let param = fa2_batch_to_transfer_list(tokens.fa2_batch, from_, to_) in
  let c = address_to_contract_transfer_entrypoint(tokens.fa2_address) in
  (Tezos.transaction param 0mutez c)

let tokens_to_transfer_list((tokens_list, from_, to_) : tokens list * address * address) : (operation list) =
   (List.map (tokens_to_operation from_ to_) tokens_list)

let get_auction_data ((asset_id, storage) : nat * storage) : auction =
  match (Big_map.find_opt asset_id storage.auctions) with
      None -> (failwith "ASSET DOES NOT EXIST" : auction)
    | Some auction -> auction

(* We only return bids to past SENDERs so this should never fail *)
let resolve_contract (add : address) : unit contract =
  match ((Tezos.get_contract_opt add) : (unit contract) option) with
      None -> (failwith "" : unit contract)
    | Some c -> c

let auction_in_progress (auction : auction) : bool =
  ((Tezos.now <= auction.start_time + auction.auction_time) &&
  (Tezos.now <= auction.last_bid_time + auction.round_time ||
  Tezos.now <= auction.start_time ))

let first_bid (auction : auction) : bool =
  auction.highest_bidder = auction.seller

let valid_bid_amount (auction : auction) : bool =
  (Tezos.amount >= auction.current_bid + auction.min_raise ||
  ((Tezos.amount >= auction.current_bid) && first_bid(auction)))

let configure_auction(configure_param, storage : configure_param * storage) : return = begin
    let now = Tezos.now in
    assert (Tezos.sender = Tezos.source);
    assert(configure_param.auction_time <= storage.max_auction_time);
    assert(configure_param.start_time <= now + int(storage.max_config_to_start_time));
    assert(Tezos.amount = 0mutez);
    assert(configure_param.round_time > 0n);
    (*assert(configure_param.start_time > now);*)

    let auction_data : auction = {
      seller = Tezos.sender;
      current_bid = configure_param.opening_price;
      start_time = configure_param.start_time;
      round_time = int(configure_param.round_time);
      asset = configure_param.asset;
      min_raise = configure_param.min_raise;
      auction_time = int(configure_param.auction_time);
      highest_bidder = Tezos.sender;
      last_bid_time = now; (*Just a default value*)
    } in
    let updated_auctions : (nat, auction) big_map = Big_map.update storage.current_id (Some auction_data) storage.auctions in
    let fa2_transfers : operation list = tokens_to_transfer_list(configure_param.asset, Tezos.sender, Tezos.self_address) in
    (fa2_transfers, {storage with auctions = updated_auctions; current_id = storage.current_id + 1n})
  end

let resolve_auction(asset_id, storage : nat * storage) : return = begin
    assert(Tezos.sender = Tezos.source);
    let auction : auction = get_auction_data(asset_id, storage) in
    assert(not auction_in_progress(auction));
    assert(Tezos.amount = 0mutez);

    let fa2_transfers : operation list = tokens_to_transfer_list(auction.asset, Tezos.self_address, auction.highest_bidder) in
    let ops : operation list = if (not first_bid(auction)) then
      let seller_contract : unit contract = resolve_contract(auction.seller) in
      let send_fee = Tezos.transaction unit auction.current_bid seller_contract in
      (send_fee :: fa2_transfers) else fa2_transfers in
    let updated_auctions = Big_map.remove asset_id storage.auctions in
    (ops, {storage with auctions = updated_auctions})
  end

let cancel_auction(asset_id, storage : nat * storage) : return = begin
    assert(Tezos.sender = Tezos.source);
    let auction : auction = get_auction_data(asset_id, storage) in
    assert(Tezos.sender = auction.seller);
    assert(auction_in_progress(auction));
    assert(Tezos.amount = 0mutez);

    let fa2_transfers : operation list = tokens_to_transfer_list(auction.asset, Tezos.self_address, auction.seller) in
    let ops : operation list = if (not first_bid(auction)) then
      let highest_bidder_contract : unit contract = resolve_contract(auction.highest_bidder) in
      let return_bid = Tezos.transaction unit auction.current_bid highest_bidder_contract in
      (return_bid :: fa2_transfers) else fa2_transfers in
    let updated_auctions = Big_map.remove asset_id storage.auctions in
    (ops, {storage with auctions = updated_auctions})
  end

let place_bid(asset_id, storage : nat * storage) : return = begin
    assert(Tezos.sender = Tezos.source);
    let auction : auction = get_auction_data(asset_id, storage) in
    assert(auction_in_progress(auction));
    assert(valid_bid_amount(auction));
    assert(Tezos.sender <> auction.seller);

    let ops : operation list = if (not first_bid(auction)) then
      let highest_bidder_contract : unit contract = resolve_contract(auction.highest_bidder) in
      let return_bid = Tezos.transaction unit auction.current_bid highest_bidder_contract in
      [return_bid] else ([] : operation list) in
    let updated_auction_data = {auction with current_bid = Tezos.amount; highest_bidder = Tezos.sender; last_bid_time = Tezos.now} in
    let updated_auctions = Big_map.update asset_id (Some updated_auction_data) storage.auctions in
    (ops , {storage with auctions = updated_auctions})
  end

let english_auction_tez_main (p,storage : auction_entrypoints * storage) : return = match p with
  | Configure config -> configure_auction(config, storage)
  | Bid asset_id -> place_bid(asset_id, storage)
  | Cancel asset_id -> cancel_auction(asset_id, storage)
  | Resolve asset_id -> resolve_auction(asset_id, storage)
