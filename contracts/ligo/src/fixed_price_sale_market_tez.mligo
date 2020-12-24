#include "../fa2/fa2_tzip16_interface.mligo"

type global_token_id = {
  fa2: address;
  token_id: token_id;
}

type sale = {
  token_for_sale: global_token_id; (* implied amount is 1n because it is NFT *)
  money_token: global_token_id;
  price: nat;
}


(* sale -> seller address *)
type storage = (sale, address) big_map

type market_entrypoints =
  | Sell of sale
  (* | Buy of sale *)
  (* | Cancel of sale *)



let transfer_nft(token, from, to_: global_token_id * address * address): operation =
  let fa2_transfer : ((transfer list) contract) option =
      Operation.get_entrypoint_opt "%transfer"  token.fa2 in
  let transfer_op = match fa2_transfer with
  | None -> (failwith "CANNOT_INVOKE_COLLECTIBLE_FA2" : operation)
  | Some c ->
    let tx = {
      from_ = from;
      txs= [{
        to_ = to_;
        token_id = token.token_id;
        amount = 1n;
    }]} in
    Operation.transaction [tx] 0mutez c
 in transfer_op

let transfer_money(token, amount_, from, to_: global_token_id * nat * address * address): operation =
  let fa2_transfer : ((transfer list) contract) option =
      Operation.get_entrypoint_opt "%transfer"  token.fa2 in
  let transfer_op = match fa2_transfer with
  | None -> (failwith "CANNOT_INVOKE_MONEY_FA2" : operation)
  | Some c ->
    let tx = {
      from_ = from;
      txs= [{
        to_ = to_;
        token_id = token.token_id;
        amount = amount_;
    }]} in
    Operation.transaction [tx] 0mutez c
 in transfer_op

let buy_token(sale, storage: sale * storage) : operation list * storage=
  let seller = match Big_map.find_opt sale storage with
  | None -> (failwith "NO_SALE": address)
  | Some s -> s
  in
  let tx_money_op = transfer_money(sale.money_token, sale.price, Tezos.sender, seller) in
  let tx_nft_op = transfer_nft(sale.token_for_sale, Tezos.self_address, Tezos.sender) in
  let new_s = Big_map.remove sale storage in
  [tx_money_op, tx_nft_op], new_s

let deposit_for_sale(sale, storage: sale * storage) : operation list * storage =
    let transfer_op =
      transfer_nft (sale.token_for_sale, Tezos.sender, Tezos.self_address) in
    let new_s = Big_map.add sale Tezos.sender storage in
    [transfer_op], new_s

let main (p, storage : market_entrypoints * storage) = match p with
  | Sell sale -> deposit_for_sale(sale, storage)
  (* | Buy sale -> buy_token(sale, storage)
   * | Cancel sale ->
   *   (match Big_map.find_opt sale storage with
   *   | None -> (failwith "NO_SALE" : storage)
   *   | Some owner -> if owner = Tezos.sender
   *     then
   *       Big_map.remove sale storage
   *       (\** todo transfer back nft *\)
   *     else (failwith "NOT_OWNER": storage)
   *   ) *)
