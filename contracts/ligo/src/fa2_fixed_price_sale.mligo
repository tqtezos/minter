#include "fa2_fixed_price_sale_contract.mligo"

// Fixed-price sale
// The asset is transferred to a sale contract
// An execution price is specified by the seller
// The execution price is met by a buyer (who signs the transaction)
// The transfer and transaction are executed once a buyer submits a valid transaction
// Note: there is no date specified - the seller would need to end the sale, i.e. “flush”

type seller = key_hash
type asset = nat
type execution_price = tez
type buyer = key_hash

type flush_sale_param = asset

type fixed_sale_entrypoints =
       Transfer_asset of asset * seller
     | Initiate_sale of asset * seller * execution_price
     | Buy_asset of (asset * buyer)
     | Get_sale_params of sale_contract_params
     | Flush_sale of flush_sale_param
     | Default

type fixed_sale_storage = { active_sales : (asset, seller * address option) big_map; some_sale_params : sale_contract_params option;}

let transfer_asset (asset : asset) (seller : seller) (storage : fixed_sale_storage) : (operation list * fixed_sale_storage) =
  if Big_map.mem asset storage.active_sales
  then (failwith "asset has already been transferred" : operation list * fixed_sale_storage)
  else ([] : operation list), {storage with active_sales = Big_map.add asset (seller, (None : address option)) storage.active_sales;}

let factory_address : address = Tezos.address (Tezos.self "%default" : unit contract)

let initiate_sale (asset : asset) (seller : seller) (execution_price : execution_price) (storage : fixed_sale_storage) : (operation list * fixed_sale_storage) =
  match Big_map.find_opt asset storage.active_sales with
  | None -> (failwith "Asset not associated with seller" :  operation list * fixed_sale_storage)
  | Some s ->
     let contract_storage = { sale_asset = asset;
                              sale_buyer = (None : key_hash option);
                              sale_seller = seller;
                              sale_price = execution_price;
                              sale_state = Asset_transferred;
                              sale_master = factory_address;
                            }
     in let origination : operation * address =
       Tezos.create_contract (fun (p, s : nat * fixed_sale_contract_storage) -> (([] : operation list), s))
         (None : key_hash option)
         0tz
         contract_storage
     in [origination.0], {storage with active_sales = Big_map.update asset (Some (seller, Some origination.1)) storage.active_sales;}

let get_sale_address_unsafe (asset : asset) (storage : fixed_sale_storage) : address =
  let sale_address_option = match (Big_map.find_opt asset storage.active_sales) with
       | None -> (failwith "Couldn't find contract address" : address option)
       | Some arg -> arg.1
    in let sale_address = match sale_address_option with
      | None -> (failwith "Couldn't find contract address" : address)
      | Some addr -> addr in sale_address

let buyer_present (arg : buyer option) : bool =
  match arg with
  | Some s -> true
  | None -> false

let isSaleOngoing (arg : sale_state) : bool =
  match arg with
  | Asset_transferred -> false
  | Sale_ongoing -> true
  | Sale_ended -> false

let buy_asset (asset : asset) (buyer : buyer) (storage : fixed_sale_storage) : operation list * fixed_sale_storage =
  let sale_address = get_sale_address_unsafe asset storage in
  let contract_params = match storage.some_sale_params with
    | None -> (failwith "Cannot get contract params" : sale_contract_params)
    | Some cp -> cp
  in match (Tezos.get_entrypoint_opt "%sale_buy_asset%" sale_address : buyer contract option) with
  | None -> (failwith "" : operation list * fixed_sale_storage)
  | Some c -> if (not (buyer_present contract_params.sale_buyer)) && isSaleOngoing contract_params.sale_state
              then [Tezos.transaction buyer 0tz c], storage
              else (failwith "Cannot buy asset" : operation list * fixed_sale_storage)

let request_sale_params (asset :asset) (storage : fixed_sale_storage) : (operation * fixed_sale_storage) =
  let sale_address = get_sale_address_unsafe asset storage in
    match (Tezos.get_entrypoint_opt "%sale_view_sale%" sale_address : address contract option) with
        | None -> (failwith "Couldn't get sale contract entrypoint %sale_viewe_sale%" : operation * fixed_sale_storage)
        | Some c -> Tezos.transaction factory_address 0tz c, storage

let send_flush (seller_address : address) : operation =
  match (Tezos.get_entrypoint_opt "%sale_flush_sale%" seller_address : unit  contract option) with
  | None -> (failwith "Couldn't access %sale_flush_sale% entrypoint" : operation)
  | Some c -> Tezos.transaction () 0tz c

 let flush_specified_sale (param : flush_sale_param) (storage : fixed_sale_storage) : (operation list * fixed_sale_storage) =
     match Big_map.find_opt param storage.active_sales with
     | None -> ([] : operation list), {storage with active_sales = Big_map.update param (None : (seller * address option) option) storage.active_sales;}
     | Some s -> let addr = get_sale_address_unsafe param storage in [send_flush addr], {storage with active_sales = Big_map.update param (None : (seller * address option) option) storage.active_sales;}

let fixed_sale_main (param, storage : fixed_sale_entrypoints * fixed_sale_storage) : operation list * fixed_sale_storage =
  match param with
  | Transfer_asset transfer_asset_params  -> transfer_asset transfer_asset_params.0 transfer_asset_params.1 storage
  | Initiate_sale initiate_sale_params -> initiate_sale initiate_sale_params.0 initiate_sale_params.1 initiate_sale_params.2 storage
  | Buy_asset buy_asset_params ->
     let opss1 = request_sale_params buy_asset_params.0 storage in
     let opss2 = buy_asset buy_asset_params.0 buy_asset_params.1 opss1.1 in
     (opss1.0 :: opss2.0), opss2.1
  | Get_sale_params params -> ([] : operation list), {storage with some_sale_params = Some params;}
  | Flush_sale flush_sale_param -> flush_specified_sale flush_sale_param storage
  | Default -> ([] : operation list), storage
