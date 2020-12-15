type execution_price = tez

type asset = nat

type sale_contract_id = nat

type sale_state = Asset_transferred | Sale_ongoing | Sale_ended

type sale_contract_params = {
     sale_asset : asset;
     sale_buyer : key_hash option;
     sale_seller : key_hash;
     sale_price : execution_price;
     sale_state : sale_state;
     sale_master : address;
}

type buyer = key_hash

type fixed_sale_contract_entrypoints =
    Sale_initiate_sale of sale_contract_params
  | Sale_buy_asset of buyer
  | Sale_view_sale of address
  | Sale_flush_sale

type fixed_sale_contract_storage = sale_contract_params

// LEAVE THIS HERE FOR TESTING THIS CONTRACT IN ISOLATION
let initiate_sale (param, storage : sale_contract_params * fixed_sale_contract_storage) : (operation list * fixed_sale_contract_storage) =
  let s = {
     sale_asset = param.sale_asset;
     sale_buyer =  param.sale_buyer;
     sale_seller  = param.sale_seller;
     sale_price  = param.sale_price;
     sale_state  = param.sale_state;
     sale_master  = param.sale_master;
     }
  in ([] : operation list), s

let buy_asset (buyer : buyer) (storage : fixed_sale_contract_storage) : (operation list * fixed_sale_contract_storage) =
  // assume check that nobody has bought the asset has been done
  let execution_price : tez = 1_000_000n * storage.sale_price in
  let seller = storage.sale_seller in
  let credit_seller = Tezos.transaction () execution_price (Tezos.implicit_account seller) in
  let debit_buyer = Tezos.transaction () (0tz - execution_price) (Tezos.implicit_account buyer) in
  (credit_seller :: (debit_buyer :: [])) , {storage with sale_buyer = Some buyer;}

let view_sale (master : address) (storage : fixed_sale_contract_storage) : (operation list * fixed_sale_contract_storage) =
  if master = storage.sale_master
  then match (Tezos.get_entrypoint_opt "%get_sale%" storage.sale_master : sale_contract_params contract option) with
   | None -> (failwith "master contract doesn't exist?" : operation list * fixed_sale_contract_storage)
   | Some c -> [Tezos.transaction storage 0tz c], storage
  else (failwith "view_sale failed" : operation list * fixed_sale_contract_storage)

let flush_sale (storage : fixed_sale_contract_storage) : (operation list * fixed_sale_contract_storage) =
  match storage.sale_state with
  | Asset_transferred -> ([] : operation list), { storage with sale_state = Sale_ended;}
  | Sale_ongoing -> ([] : operation list), { storage with sale_state = Sale_ended;}
  | Sale_ended -> (failwith "Sale already ended" : operation list * fixed_sale_contract_storage)

let fixed_sale_contract_main (param, storage : fixed_sale_contract_entrypoints * fixed_sale_contract_storage) : (operation list * fixed_sale_contract_storage) =
    match param with
    | Sale_initiate_sale sale_params -> initiate_sale (sale_params, storage)
    | Sale_buy_asset buy_params -> buy_asset buy_params storage
    | Sale_flush_sale -> flush_sale storage
    | Sale_view_sale master -> view_sale master storage
