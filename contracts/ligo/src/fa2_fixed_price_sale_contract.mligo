type execution_price = tez

type asset_id = nat

type asset = asset_id * address

type sale_contract_id = nat

type sale_contract_params = {
     sale_asset : asset;
     sale_buyer : address;
     sale_seller : address;
     sale_price : execution_price;
}

type buyer = address

type fixed_sale_contract_entrypoints =
    Initiate_sale of sale_contract_params
  | Buy_asset of execution_price * buyer
  | Flush_sale

type fixed_sale_contract_storage = sale_contract_params option

let initiate_sale (param, storage : sale_contract_params * fixed_sale_contract_storage) : (operation list * fixed_sale_contract_storage) =
  let s = Some {
     sale_asset = param.sale_asset;
     sale_buyer =  param.sale_buyer;
     sale_seller  = param.sale_seller;
     sale_price  = param.sale_price;
     }
  in ([] : operation list), s

let buy_asset (execution_price : execution_price) (buyer : buyer) (storage : fixed_sale_contract_storage) : (operation list * fixed_sale_contract_storage) =
  match storage with
  | None -> let u = failwith "Cannot buy non-existent asset" in ([] : operation list),  storage
  | Some s -> ([] : operation list), Some s

let fixed_sale_contract_main (param, storage : fixed_sale_contract_entrypoints * fixed_sale_contract_storage) : (operation list * fixed_sale_contract_storage) =
    match param with
    | Initiate_sale sale_params -> initiate_sale (sale_params, storage)
    | Buy_asset buy_params -> buy_asset buy_params.0 buy_params.1 storage
    | Flush_sale -> ([] : operation list), (None : fixed_sale_contract_storage)
