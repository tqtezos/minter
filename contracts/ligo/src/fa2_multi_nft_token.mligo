#if !FA2_MULTI_NFT_TOKEN

#define FA2_MULTI_NFT_TOKEN

#include "../fa2/fa2_interface.mligo"
#include "../fa2/fa2_errors.mligo"

#include "../fa2/lib/fa2_convertors.mligo"
#include "../fa2/lib/fa2_operator_lib.mligo"
#include "../fa2/lib/fa2_owner_hooks_lib.mligo"


type nft_meta = (token_id, token_metadata_michelson) big_map

type ledger = (token_id, address) big_map


#if !OWNER_HOOKS

type nft_token_storage = {
  ledger : ledger;
  token_metadata : nft_meta;
  next_token_id : token_id;
  operators : operator_storage;
}

let get_owner_hook_ops (tx_descriptors, storage
    : (transfer_descriptor list) * nft_token_storage) : operation list =
  ([] : operation list)

#else

type nft_token_storage = {
  ledger : ledger;
  token_metadata : nft_meta;
  next_token_id : token_id;
  operators : operator_storage;
  permissions_descriptor : permissions_descriptor;
}

let get_owner_hook_ops (tx_descriptors, storage
    : (transfer_descriptor list) * nft_token_storage) : operation list =
  let tx_descriptor_param : transfer_descriptor_param = {
    batch = tx_descriptors;
    operator = Tezos.sender;
  } in
  get_owner_hook_ops_for (tx_descriptor_param, storage.permissions_descriptor)

#endif

(**
Update leger balances according to the specified transfers. Fails if any of the
permissions or constraints are violated.
@param txs transfers to be applied to the ledger
@param owner_validator function that validates of the tokens from the particular owner can be transferred. 
 *)
let transfer (txs, owner_validator, ops_storage, ledger
    : (transfer_descriptor list) * ((address * operator_storage) -> unit) * operator_storage * ledger)
    : ledger = 
  let make_transfer = fun (l, tx : ledger * transfer_descriptor) ->
    let u = match tx.from_ with
    | None -> unit
    | Some o -> owner_validator (o, ops_storage)
    in
    List.fold 
      (fun (ll, dst : ledger * transfer_destination_descriptor) ->
        let current_owner = Big_map.find_opt dst.token_id ll in
        match current_owner with
        | None -> (failwith fa2_token_undefined : ledger)
        | Some o -> 
          if dst.amount = 0n
          then ll (* zero amount transfer, don't change the ledger *)
          else if dst.amount > 0n (* invalid amount for nft *)
          then (failwith fa2_insufficient_balance : ledger)
          else ( 
            let lll = match tx.from_ with
            | None -> ll (* this is a mint transfer. do not need to update `from_` balance *)
            | Some from_ ->
              if from_ <> o
              then (failwith fa2_insufficient_balance : ledger)
              else Big_map.remove dst.token_id ll
            in 
            match dst.to_ with
            | None -> lll (* this is a burn transfer. do not need to update `to_` balance *)
            | Some to_ -> Big_map.add dst.token_id to_ lll
          )
      ) tx.txs l
  in    
  List.fold make_transfer txs ledger

let fa2_transfer (tx_descriptors, validator, storage
    : (transfer_descriptor list) * ((address * operator_storage)-> unit) * nft_token_storage)
    : (operation list) * nft_token_storage =
  
  let new_ledger = transfer (tx_descriptors, validator, storage.operators, storage.ledger) in
  let new_storage = { storage with ledger = new_ledger; } in
  let ops = get_owner_hook_ops (tx_descriptors, storage) in
  ops, new_storage

(** 
Retrieve the balances for the specified tokens and owners
@return callback operation
*)
let get_balance (p, ledger : balance_of_param * ledger) : operation =
  let to_balance = fun (r : balance_of_request) ->
    let owner = Big_map.find_opt r.token_id ledger in
    let response = match owner with
    | None -> (failwith fa2_token_undefined : balance_of_response)
    | Some o ->
      let bal = if o = r.owner then 1n else 0n in
      { request = r; balance = bal; }
    in
    balance_of_response_to_michelson response
  in
  let responses = List.map to_balance p.requests in
  Operation.transaction responses 0mutez p.callback


let fa2_main (param, storage : fa2_entry_points * nft_token_storage)
    : (operation  list) * nft_token_storage =
  match param with
  | Transfer txs_michelson -> 
    (* convert transfer batch into `transfer_descriptor` batch *)
    let txs = transfers_from_michelson txs_michelson in
    let tx_descriptors = transfers_to_descriptors txs in
    (* 
    will validate that a sender is either `from_` parameter of each transfer
    or a permitted operator for the owner `from_` address.
    *)
    let validator = make_default_operator_validator Tezos.sender in

    fa2_transfer (tx_descriptors, validator, storage)

  | Balance_of pm ->
    let p = balance_of_param_from_michelson pm in
    let op = get_balance (p, storage.ledger) in
    [op], storage

  | Update_operators updates_michelson ->
    let new_operators = fa2_update_operators (updates_michelson, storage.operators) in
    let new_storage = { storage with operators = new_operators; } in
    ([] : operation list), new_storage

  | Token_metadata_registry callback ->
    (* the contract storage holds `token_metadata` big_map*)
    let callback_op = Operation.transaction Tezos.self_address 0mutez callback in
    [callback_op], storage

#endif