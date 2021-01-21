#include "../fa2/fa2_tzip16_interface.mligo"

type global_token_id =
{
  fa2: address;
  token_id: token_id;
}

type sale_token_param_tez =
[@layout:comb]
{
 token_for_sale_address: address;
 token_for_sale_token_id: token_id;
}

type sale_param_tez =
[@layout:comb]
{
  sale_price: tez; // assume in mutez?
  sale_token: sale_token_param_tez;
}

type storage = (sale_param_tez, address) big_map

type market_entry_points =
  | Sell of sale_param_tez
  | Buy of sale_param_tez
  | Cancel of sale_param_tez

let transfer_nft(fa2_address, token_id, from, to_: address * token_id * address * address): operation =
  let fa2_transfer : ((transfer list) contract) option =
      Tezos.get_entrypoint_opt "%transfer"  fa2_address in
  let transfer_op = match fa2_transfer with
  | None -> (failwith "CANNOT_INVOKE_FA2_TRANSFER" : operation)
  | Some c ->
    let tx = {
      from_ = from;
      txs= [{
        to_ = to_;
        token_id = token_id;
        amount = 1n;
    }]} in
    Tezos.transaction [tx] 0mutez c in
  transfer_op

let add_operator_nft(fa2_address, token_id, from, to_: address * token_id * address * address): operation =
  let fa2_update_operator : ((update_operator list) contract) option =
    Tezos.get_entrypoint_opt "%update_operators" fa2_address in
  let update_operator_op = match fa2_update_operator with
    | None -> (failwith "CANNOT_INVOKE_FA2_UPDATE_OPERATOR" : operation)
    | Some c ->
       if to_ <> Tezos.sender
       then (failwith "sender not to_: " : operation)
       else let tx = Add_operator ( { owner = to_; operator = from; token_id = token_id; } ) in
            Tezos.transaction [tx] 0mutez c in
  update_operator_op

let remove_operator_nft(fa2_address, token_id, operator, owner: address * token_id * address * address): operation =
  let fa2_update_operator : ((update_operator list) contract) option =
    Tezos.get_entrypoint_opt "%update_operators" fa2_address in
  let update_operator_op = match fa2_update_operator with
    | None -> (failwith "CANNOT_INVOKE_FA2_UPDATE_OPERATOR" : operation)
    | Some c ->
       let tx = Remove_operator ( { owner = owner; operator = operator; token_id = token_id; } ) in
       Tezos.transaction [tx] 0mutez c in
  update_operator_op

let transfer_money(fa2_address, token_id, amount_, from, to_: address * token_id * nat * address * address): operation =
  let fa2_transfer : ((transfer list) contract) option =
      Tezos.get_entrypoint_opt "%transfer"  fa2_address in
  let transfer_op = match fa2_transfer with
  | None -> (failwith "CANNOT_INVOKE_MONEY_FA2" : operation)
  | Some c ->
    let tx = {
      from_ = from;
      txs= [{
        to_ = to_;
        token_id = token_id;
        amount = amount_;
    }]} in
    Tezos.transaction [tx] 0mutez c
 in transfer_op


let transfer_tez (price, buyer, seller : tez * address * address) : operation =
  let buyer_account = match (Tezos.get_contract_opt buyer : unit contract option) with
    | None -> (failwith "NO_BUYER_ACCOUNT" : unit contract)
    | Some acc -> acc
  in let seller_account = match (Tezos.get_contract_opt seller : unit contract option) with
    | None -> (failwith "NO_SELLER_ACCOUNT" : unit contract)
    | Some acc -> acc
     in let gtTez = if Tezos.amount > price then failwith "MORE_THAN_ENOUGH_TEZ_TO_BUY" else () in
        let ltTez = if Tezos.amount < price then failwith "LESS_THAN_ENOUGH__TEZ_TO_BUY" else () in
        Tezos.transaction () Tezos.amount seller_account
        (* if Tezos.amount > price *)
        (* then (failwith "MORE_THAN_ENOUGH_TEZ_TO_BUY" : operation list) *)
        (* else *)
     (* let debit_op = Tezos.transaction () (0tz - price) buyer_account in *)

let buy_token(sale, storage: sale_param_tez * storage) : (operation list * storage) =
  let seller = match Big_map.find_opt sale storage with
  | None -> (failwith "NO_SALE": address)
  | Some s -> s
  in
  let tx_money_ops = transfer_tez(sale.sale_price, Tezos.sender, seller) in
  let tx_nft_op = transfer_nft(sale.sale_token.token_for_sale_address, sale.sale_token.token_for_sale_token_id, Tezos.self_address, Tezos.sender) in
  (* let tx_nft_remove_operator_op = remove_operator_nft(sale.sale_token.token_for_sale_address, sale.sale_token.token_for_sale_token_id, Tezos.self_address, Tezos.sender) in *)
  let new_s = Big_map.remove sale storage in
  (tx_money_ops :: tx_nft_op :: []), new_s

let deposit_for_sale(sale, storage: sale_param_tez * storage) : (operation list * storage) =
    let transfer_op =
      transfer_nft (sale.sale_token.token_for_sale_address, sale.sale_token.token_for_sale_token_id, Tezos.sender, Tezos.self_address) in
    (* let add_operator_op = add_operator_nft (sale.sale_token.token_for_sale_address, sale.sale_token.token_for_sale_token_id, Tezos.self_address, Tezos.sender) in *)
    let new_s = Big_map.add sale Tezos.sender storage in
    (transfer_op :: []), new_s

let cancel_sale(sale, storage: sale_param_tez * storage) : (operation list * storage) = match Big_map.find_opt sale storage with
    | None -> (failwith "NO_SALE" : (operation list * storage))
    | Some owner -> if owner = Tezos.sender then
                      let tx_nft_back_op = transfer_nft(sale.sale_token.token_for_sale_address, sale.sale_token.token_for_sale_token_id, Tezos.self_address, Tezos.sender) in
                      (* let remove_operator_op =
                       *   remove_operator_nft(sale.sale_token.token_for_sale_address,sale.sale_token.token_for_sale_token_id,Tezos.self_address,Tezos.sender)
                       * in *)
                      (tx_nft_back_op :: []), Big_map.remove sale storage
      else (failwith "NOT_OWNER": (operation list * storage))

let fixed_price_sale_tez_main (p, storage : market_entry_points * storage) : operation list * storage = match p with
  | Sell sale -> deposit_for_sale(sale, storage)
  | Buy sale -> buy_token(sale, storage)
  | Cancel sale -> cancel_sale(sale,storage)
