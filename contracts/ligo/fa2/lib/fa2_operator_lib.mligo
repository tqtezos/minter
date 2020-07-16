(** 
Reference implementation of the FA2 operator storage, config API and 
helper functions 
*)

#if !FA2_OPERATOR_LIB
#define FA2_OPERATOR_LIB

#include "fa2_convertors.mligo"
#include "../fa2_errors.mligo"

(** 
(owner, operator) -> unit
To be part of FA2 storage to manage permitted operators
*)
type operator_storage = ((address * address), unit) big_map

(** 
  Updates operator storage using an `update_operator` command.
  Helper function to implement `Update_operators` FA2 entry point
*)
let update_operators (update, storage : update_operator * operator_storage)
    : operator_storage =
  match update with
  | Add_operator_p op -> 
    Big_map.update (op.owner, op.operator) (Some unit) storage
  | Remove_operator_p op -> 
    Big_map.remove (op.owner, op.operator) storage

(**
Validate if operator update is performed by the token owner.
@param updater an address that initiated the operation; usually `Tezos.sender`.
*)
let validate_update_operators_by_owner (update, updater : update_operator * address)
    : unit =
  let op = match update with
  | Add_operator_p op -> op
  | Remove_operator_p op -> op
  in
  if op.owner = updater then unit else failwith fa2_not_owner

(**
Create an operator validator function based on provided operator policy.
@param tx_policy operator_transfer_policy defining the constrains on who can transfer.
 *)
let make_operator_validator (tx_policy : operator_transfer_policy)
    : (address * operator_storage)-> unit =
  let can_owner_tx, can_operator_tx = match tx_policy with
  | No_transfer -> (failwith fa2_tx_denied : bool * bool)
  | Owner_transfer -> true, false
  | Owner_or_operator_transfer -> true, true
  in
  let operator : address = Tezos.sender in
  (fun (owner, ops_storage : address * operator_storage) ->
      if can_owner_tx && owner = operator
      then unit
      else
        if not can_operator_tx
        then failwith fa2_not_owner
        else
          if Big_map.mem  (owner, operator) ops_storage
          then unit else failwith fa2_not_operator
  )

(**
Default implementation of the operator validation function.
The default implicit `operator_transfer_policy` value is `Owner_or_operator_transfer`
 *)
let make_default_operator_validator (operator : address)
    : (address * operator_storage)-> unit =
  (fun (owner, ops_storage : address * operator_storage) ->
      if owner = operator
      then unit
      else
        if Big_map.mem  (owner, operator) ops_storage
        then unit else failwith fa2_not_operator
  )

(** 
Validate operators for all transfers in the batch at once
@param tx_policy operator_transfer_policy defining the constrains on who can transfer.
*)
let validate_operator (tx_policy, txs, ops_storage 
    : operator_transfer_policy * (transfer list) * operator_storage) : unit =
  let validator = make_operator_validator tx_policy in
  List.iter (fun (tx : transfer) -> validator (tx.from_, ops_storage)) txs

#endif
