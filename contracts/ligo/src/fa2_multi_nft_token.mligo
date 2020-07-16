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
  last_used_id : token_id;
  operators : operator_storage;
}

#else

type nft_token_storage = {
  ledger : ledger;
  token_metadata : nft_meta;
  last_used_id : token_id;
  operators : operator_storage;
  permissions_descriptor : permissions_descriptor;
}

#endif

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
    (* let txs = transfers_from_michelson txs_michelson in
    let tx_descriptors = transfers_to_descriptors txs in *)
    (* 
    will validate that a sender is either `from_` parameter of each transfer
    or a permitted operator for the owner `from_` address.
    *)
    (* let validator = make_default_operator_validator Tezos.sender in

    fa2_transfer (tx_descriptors, validator, storage) *)
    ([] : operation list), storage

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