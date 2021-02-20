#include "../fa2/fa2_interface.mligo"
#include "../fa2_modules/simple_admin.mligo"

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
  sale_seller: address;
  sale_token: sale_token_param_tez;
}

type storage =
[@layout:comb]
{
  admin: simple_admin_storage;
  sales: (sale_param_tez, tez) big_map;
}

type init_sale_param_tez =
[@layout:comb]
{
  sale_price: tez;
  sale_token_param_tez: sale_token_param_tez;
}

type market_entry_points =
  | Sell of init_sale_param_tez
  | Buy of sale_param_tez
  | Cancel of sale_param_tez
  | Admin of simple_admin

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

let transfer_tez (price, seller : tez * address) : operation =
  let seller_account = match (Tezos.get_contract_opt seller : unit contract option) with
    | None -> (failwith "NO_SELLER_ACCOUNT" : unit contract)
    | Some acc -> acc
     in let amountError = if Tezos.amount <> price then failwith "WRONG_TEZ_PRICE" else () in
        Tezos.transaction () Tezos.amount seller_account

let buy_token(sale, storage: sale_param_tez * storage) : (operation list * storage) =
  let sale_price = match Big_map.find_opt sale storage.sales with
  | None -> (failwith "NO_SALE": tez)
  | Some s -> s
  in let tx_ops = transfer_tez(sale_price, sale.sale_seller) in
  let tx_nft_op = transfer_nft(sale.sale_token.token_for_sale_address, sale.sale_token.token_for_sale_token_id, Tezos.self_address, Tezos.sender) in
  let new_s = { storage with sales = Big_map.remove sale storage.sales } in
  (tx_ops :: tx_nft_op :: []), new_s

let deposit_for_sale(sale_token, price, storage: sale_token_param_tez * tez * storage) : (operation list * storage) =
    let transfer_op =
      transfer_nft (sale_token.token_for_sale_address, sale_token.token_for_sale_token_id, Tezos.sender, Tezos.self_address) in
    let sale_param = { sale_seller = Tezos.sender; sale_token = sale_token } in
    let new_s = { storage with sales = Big_map.add sale_param price storage.sales } in
    (transfer_op :: []), new_s

let cancel_sale(sale, storage: sale_param_tez * storage) : (operation list * storage) = match Big_map.find_opt sale storage.sales with
    | None -> (failwith "NO_SALE" : (operation list * storage))
    | Some price -> if sale.sale_seller = Tezos.sender then
                      let tx_nft_back_op = transfer_nft(sale.sale_token.token_for_sale_address, sale.sale_token.token_for_sale_token_id, Tezos.self_address, Tezos.sender) in
                      (tx_nft_back_op :: []), {storage with sales = Big_map.remove sale storage.sales }
      else (failwith "NOT_OWNER": (operation list * storage))

let fixed_price_sale_tez_main (p, storage : market_entry_points * storage) : operation list * storage = match p with
  | Sell sale ->
     let u = fail_if_paused(storage.admin) in
     deposit_for_sale(sale.sale_token_param_tez, sale.sale_price, storage)
  | Buy sale ->
     let u = fail_if_paused(storage.admin) in
     buy_token(sale, storage)
  | Cancel sale ->
     let u = fail_if_not_admin storage.admin in
     let v = fail_if_paused(storage.admin) in
     cancel_sale(sale,storage)
  | Admin a ->
     let ops, admin = simple_admin(a, storage.admin) in
     let new_storage = { storage with admin = admin; } in
     ops, new_storage
