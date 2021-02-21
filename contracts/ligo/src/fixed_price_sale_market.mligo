#include "../fa2/fa2_interface.mligo"
#include "../fa2_modules/simple_admin.mligo"

type global_token_id =
{
  fa2: address;
  token_id: token_id;
}

type sale_tokens_param =
[@layout:comb]
{
 token_for_sale_address: address;
 token_for_sale_token_id: token_id;
 money_token_address: address;
 money_token_token_id: token_id;
}

type sale_param =
[@layout:comb]
{
  sale_seller: address;
  tokens: sale_tokens_param;
}

type init_sale_param =
[@layout:comb]
{
  sale_price: nat;
  sale_tokens_param: sale_tokens_param;
}

type storage = {
    admin: simple_admin_storage;
    sales: (sale_param, nat) big_map;
}

type market_entry_points =
  | Sell of init_sale_param
  | Buy of sale_param
  | Cancel of sale_param
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

let buy_token(sale, storage: sale_param * storage) : (operation list * storage) =
  let sale_price = match Big_map.find_opt sale storage.sales with
  | None -> (failwith "NO_SALE": nat)
  | Some s -> s
  in
  let tx_money_op = transfer_money(sale.tokens.money_token_address, sale.tokens.money_token_token_id, sale_price, Tezos.sender, sale.sale_seller) in
  let tx_nft_op = transfer_nft(sale.tokens.token_for_sale_address, sale.tokens.token_for_sale_token_id, Tezos.self_address, Tezos.sender) in
  let new_s = {storage with sales = Big_map.remove sale storage.sales } in
  (tx_money_op :: tx_nft_op :: []), new_s

let deposit_for_sale(sale, storage: init_sale_param * storage) : (operation list * storage) =
    let transfer_op =
      transfer_nft (sale.sale_tokens_param.token_for_sale_address, sale.sale_tokens_param.token_for_sale_token_id, Tezos.sender, Tezos.self_address) in
    let sale_param = { sale_seller = Tezos.sender; tokens = sale.sale_tokens_param; } in
    let new_s = { storage with sales = Big_map.add sale_param sale.sale_price storage.sales } in
    (transfer_op :: []), new_s

let cancel_sale(sale, storage: sale_param * storage) : (operation list * storage) = match Big_map.find_opt sale storage.sales with
    | None -> (failwith "NO_SALE" : (operation list * storage))
    | Some price -> if sale.sale_seller = Tezos.sender then
                      let tx_nft_back_op = transfer_nft(sale.tokens.token_for_sale_address, sale.tokens.token_for_sale_token_id, Tezos.self_address, Tezos.sender) in
                      (tx_nft_back_op :: []), { storage with sales = Big_map.remove sale storage.sales }
      else (failwith "NOT_OWNER": (operation list * storage))

let fixed_price_sale_main (p, storage : market_entry_points * storage) : operation list * storage = match p with
  | Sell sale ->
     let u = fail_if_paused(storage.admin) in
     deposit_for_sale(sale, storage)
  | Buy sale ->
     let u = fail_if_paused(storage.admin) in
     buy_token(sale, storage)
  | Cancel sale ->
     let is_seller = Tezos.sender = sale.sale_seller in
     let u = if is_seller then ()
             else fail_if_not_admin storage.admin (Some " OR A SELLER") in
     let v = fail_if_paused(storage.admin) in
     cancel_sale(sale,storage)
  | Admin a ->
    let ops, admin = simple_admin(a, storage.admin) in
    let new_storage = { storage with admin = admin; } in
    ops, new_storage
