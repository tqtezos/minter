#include "../fa2/fa2_interface.mligo"
#include "../fa2/fa2_errors.mligo"

(*
Fixed-price sale
The asset is transferred to a sale contract
An execution price is specified by the seller
The execution price is met by a buyer (who signs the transaction)
The transfer and transaction are executed once a buyer submits a valid transaction
Note: there is no date specified - the seller would need to end the sale, i.e. “flush”
 *)

type seller = key_hash
type asset = nat
type execution_price = tez
type buyer = key_hash
type flush_sale_param = asset
type sale_end_duration = int

type sale_state =
 Sale_ongoing
| Sale_ended

type actual_sale_params = {
     sale_buyer  : key_hash option;
     sale_seller : key_hash;
     sale_price  : execution_price;
     sale_state  : sale_state;
     sale_end_time : timestamp option;
}

type incoming_sale_params = {
     sale_asset  : asset;
     sale_buyer  : key_hash option;
     sale_seller : key_hash;
     sale_price  : execution_price;
}

type sale_params =
  Have_asset of seller
| Actual_sale of actual_sale_params

type fixed_sale_entrypoints =
  Transfer_asset of asset * seller
| Initiate_sale of incoming_sale_params
| Buy_asset of (asset * seller * buyer)
| Flush_sale of flush_sale_param

type fixed_price_sale_storage =
   {
   active_sales     : (asset, sale_params * sale_end_duration option) big_map;
   finalized_sales : asset list;
   }

type accum = (asset, sale_params * sale_end_duration option) big_map * asset list

let really_flush_finalized_sales (storage : fixed_price_sale_storage) : fixed_price_sale_storage =
  let f (acc, asset : accum * asset ) : accum =
    let sale_yet_to_be_determined = match Big_map.find_opt asset acc.0 with
      | None -> (failwith "" : sale_params * sale_end_duration option)
      | Some s -> s
    in let sale_params = match sale_yet_to_be_determined.0 with
         | Have_asset -> (failwith "" : actual_sale_params)
         | Actual_sale s -> s
    in let sale_end_duration = match sale_yet_to_be_determined.1 with
      | None -> (failwith "" : sale_end_duration)
      | Some s -> s
    in let end_time = match sale_params.sale_end_time with
        | None -> (failwith "" : timestamp)
        | Some ts -> ts
    in let is_stale = match sale_yet_to_be_determined.0 with
        | Have_asset -> false
        | Actual_sale s -> Tezos.now - (end_time + sale_end_duration) <= 0
  in let bigmap = if is_stale then Big_map.update asset (None : (sale_params * sale_end_duration option) option) acc.0 else acc.0
     in let finalized = if is_stale then acc.1 else asset :: acc.1
     in bigmap, finalized
  in let results  = List.fold f storage.finalized_sales (storage.active_sales, ([] : asset list))
     in { storage with active_sales = results.0; finalized_sales = results.1;}

let transfer_asset (asset : asset) (seller : seller) (storage : fixed_price_sale_storage) : (operation list * fixed_price_sale_storage) =
  if Big_map.mem asset storage.active_sales
  then (failwith "asset has already been transferred" : operation list * fixed_price_sale_storage)
  else ([] : operation list), {storage with active_sales = Big_map.add asset (Have_asset seller, (None : sale_end_duration option)) storage.active_sales;}

let transfer_tez (account : key_hash) (amt : tez) : operation = Tezos.transaction () amt (Tezos.implicit_account account)

// doesn't get balance of buyer, so this is incorrect, just use this function as a template for transferring tokens
let buy_asset_tez (asset, seller, buyer : asset * seller * buyer) (storage : fixed_price_sale_storage) : operation list * fixed_price_sale_storage =
  let sale_yet_to_be_determined = match Big_map.find_opt asset storage.active_sales with
    | None -> (failwith "" : sale_params * sale_end_duration option)
    | Some s -> s
  in let sale = match sale_yet_to_be_determined.0 with
       | Have_asset a -> (failwith "" : actual_sale_params)
       | Actual_sale os -> os
  in let has_buyer = match sale.sale_buyer with
       | None -> false
       | Some b -> true
  in let matches_seller = sale.sale_seller = seller
  in let is_ongoing = match sale.sale_state with
       | Sale_ongoing -> true
       | Sale_ended -> false
  in let u = if not matches_seller || has_buyer || is_ongoing then (failwith "" : unit) else ()
  in let execution_price : tez = 1_000_000n * sale.sale_price // has to be in mutez
  in let buy_op = transfer_tez buyer (0tz - execution_price)
  in let sell_op = transfer_tez sale.sale_seller execution_price
  in let updated_sale_params = { sale with sale_buyer = Some buyer; sale_state = Sale_ended; sale_end_time = Some Tezos.now;}
  in (buy_op :: sell_op :: []), { storage with active_sales =
    Big_map.update asset (Some (Actual_sale updated_sale_params, sale_yet_to_be_determined.1)) storage.active_sales;
    finalized_sales = (asset :: storage.finalized_sales);}

let flush_specified_sale (param : flush_sale_param) (storage : fixed_price_sale_storage) : (operation list * fixed_price_sale_storage) =
  let stor = really_flush_finalized_sales storage
  in match Big_map.find_opt param stor.active_sales with
  | None -> ([] : operation list), stor
  | Some s -> ([] : operation list), { stor with finalized_sales = param :: storage.finalized_sales;}

let initiate_sale (param: incoming_sale_params) (storage : fixed_price_sale_storage) : (operation list * fixed_price_sale_storage) =
  let queried_asset_and_end_duration = match Big_map.find_opt param.sale_asset storage.active_sales with
     | None -> (failwith "No sale associated with asset" : sale_params * sale_end_duration option)
     | Some s -> s
  in let queried_asset = match queried_asset_and_end_duration.0 with
       | Have_asset a -> param.sale_asset
       | Actual_sale -> (failwith "impossible: ongoing sale?" : asset)
  in let sale_end_duration = match queried_asset_and_end_duration.1 with
       | Some s -> Some s // reusing sale parameters?
       | None -> Some (5 * 60) // use default setting of 5 minutes in terms of seconds
  in let ops = ([] : operation list)
  in let new_sale_params =
          {
            sale_buyer = (None : key_hash option);
            sale_seller = param.sale_seller;
            sale_price = param.sale_price;
            sale_state = Sale_ongoing;
            sale_end_time = (None : timestamp option);
          }
  in ops, { storage with active_sales = Big_map.update queried_asset (Some (Actual_sale new_sale_params, sale_end_duration)) storage.active_sales;}

let fixed_price_sale_main (param, storage : fixed_sale_entrypoints * fixed_price_sale_storage) : operation list * fixed_price_sale_storage =
  match param with
  | Transfer_asset transfer_asset_params  -> ([] : operation list), storage
  | Initiate_sale incoming_sale_params -> initiate_sale incoming_sale_params storage
  | Buy_asset buy_asset_params -> buy_asset_tez buy_asset_params storage
  | Flush_sale flush_sale_param -> flush_specified_sale flush_sale_param storage
