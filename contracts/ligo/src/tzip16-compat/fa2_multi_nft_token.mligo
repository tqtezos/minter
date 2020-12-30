#if !FA2_MULTI_NFT_TOKEN

#define FA2_MULTI_NFT_TOKEN

#include "../../fa2/fa2_tzip16_interface.mligo"
#include "../../fa2/fa2_errors.mligo"

#include "../../fa2/lib/fa2_operator_lib.mligo"
#include "../../fa2/lib/fa2_owner_hooks_lib.mligo"

type nft_meta = (token_id, token_metadata) big_map

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

let dec_balance(owner, token_id, ledger : address option * token_id * ledger) : ledger =
  match owner with
  | None -> ledger (* this is mint transfer, don't change the ledger *)
  | Some o -> (
    let current_owner = Big_map.find_opt token_id ledger in
    match current_owner with
    | None -> (failwith fa2_insufficient_balance : ledger)
    | Some cur_o ->
      if cur_o = o
      then Big_map.remove token_id ledger
      else (failwith fa2_insufficient_balance : ledger)
  )

let inc_balance(owner, token_id, ledger : address option * token_id * ledger) : ledger =
  match owner with
  | None -> ledger (* this is burn transfer, don't change the ledger *)
  | Some o -> Big_map.add token_id o ledger


(**
Update leger balances according to the specified transfers. Fails if any of the
permissions or constraints are violated.
@param txs transfers to be applied to the ledger
@param validate_op function that validates of the tokens from the particular owner can be transferred.
 *)
let transfer (txs, validate_op, ops_storage, ledger
    : (transfer_descriptor list) * operator_validator * operator_storage * ledger)
    : ledger =
  let make_transfer = fun (l, tx : ledger * transfer_descriptor) ->
    List.fold
      (fun (ll, dst : ledger * transfer_destination_descriptor) ->
        let u = match tx.from_ with
        | None -> unit
        | Some owner -> validate_op (owner, Tezos.sender, dst.token_id, ops_storage)
        in
        if dst.amount > 1n
        then (failwith fa2_insufficient_balance : ledger)
        else if dst.amount = 0n
        then ll (* zero transfer, don't change the ledger *)
        else
          let lll = dec_balance (tx.from_, dst.token_id, ll) in
          inc_balance(dst.to_, dst.token_id, lll)
      ) tx.txs l
  in
  List.fold make_transfer txs ledger

let fa2_transfer (tx_descriptors, validate_op, storage
    : (transfer_descriptor list) * operator_validator * nft_token_storage)
    : (operation list) * nft_token_storage =

  let new_ledger = transfer (tx_descriptors, validate_op, storage.operators, storage.ledger) in
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
    match owner with
    | None -> (failwith fa2_token_undefined : balance_of_response)
    | Some o ->
      let bal = if o = r.owner then 1n else 0n in
      { request = r; balance = bal; }
  in
  let responses = List.map to_balance p.requests in
  Operation.transaction responses 0mutez p.callback


let fa2_main (param, storage : fa2_entry_points * nft_token_storage)
    : (operation  list) * nft_token_storage =
  match param with
  | Transfer txs ->
    let tx_descriptors = transfers_to_descriptors txs in
    (*
    will validate that a sender is either `from_` parameter of each transfer
    or a permitted operator for the owner `from_` address.
    *)
    fa2_transfer (tx_descriptors, default_operator_validator, storage)

  | Balance_of p ->
    let op = get_balance (p, storage.ledger) in
    [op], storage

  | Update_operators updates ->
    let new_operators = fa2_update_operators (updates, storage.operators) in
    let new_storage = { storage with operators = new_operators; } in
    ([] : operation list), new_storage

  (* | Token_metadata_registry callback ->
   *   (\* the contract storage holds `token_metadata` big_map*\)
   *   let callback_op = Operation.transaction Tezos.self_address 0mutez callback in
   *   [callback_op], storage *)

#endif
