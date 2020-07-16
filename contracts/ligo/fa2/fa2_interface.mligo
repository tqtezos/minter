#if ! FA2_INTERFACE
#define FA2_INTERFACE

type token_id = nat

type transfer_destination = {
  to_ : address;
  token_id : token_id;
  amount : nat;
}

type transfer_destination_michelson = transfer_destination michelson_pair_right_comb

type transfer = {
  from_ : address;
  txs : transfer_destination list;
}

type transfer_aux = {
  from_ : address;
  txs : transfer_destination_michelson list;
}

type transfer_michelson = transfer_aux michelson_pair_right_comb

type balance_of_request = {
  owner : address;
  token_id : token_id;
}

type balance_of_request_michelson = balance_of_request michelson_pair_right_comb

type balance_of_response = {
  request : balance_of_request;
  balance : nat;
}

type balance_of_response_aux = {
  request : balance_of_request_michelson;
  balance : nat;
}

type balance_of_response_michelson = balance_of_response_aux michelson_pair_right_comb

type balance_of_param = {
  requests : balance_of_request list;
  callback : (balance_of_response_michelson list) contract;
}

type balance_of_param_aux = {
  requests : balance_of_request_michelson list;
  callback : (balance_of_response_michelson list) contract;
}

type balance_of_param_michelson = balance_of_param_aux michelson_pair_right_comb

type operator_param = {
  owner : address;
  operator : address;
}

type operator_param_michelson = operator_param michelson_pair_right_comb

type update_operator =
  | Add_operator_p of operator_param
  | Remove_operator_p of operator_param

type update_operator_aux =
  | Add_operator of operator_param_michelson
  | Remove_operator of operator_param_michelson

type update_operator_michelson = update_operator_aux michelson_or_right_comb

type token_metadata = {
  token_id : token_id;
  symbol : string;
  name : string;
  decimals : nat;
  extras : (string, string) map;
}

type token_metadata_michelson = token_metadata michelson_pair_right_comb

type token_metadata_param = {
  token_ids : token_id list;
  handler : (token_metadata_michelson list) -> unit;
}

type token_metadata_param_michelson = token_metadata_param michelson_pair_right_comb

type fa2_entry_points =
  | Transfer of transfer_michelson list
  | Balance_of of balance_of_param_michelson
  | Update_operators of update_operator_michelson list
  | Token_metadata_registry of address contract


type fa2_token_metadata =
  | Token_metadata of token_metadata_param_michelson

(* permission policy definition *)

type operator_transfer_policy =
  | No_transfer
  | Owner_transfer
  | Owner_or_operator_transfer

type operator_transfer_policy_michelson = operator_transfer_policy michelson_or_right_comb

type owner_hook_policy =
  | Owner_no_hook
  | Optional_owner_hook
  | Required_owner_hook

type owner_hook_policy_michelson = owner_hook_policy michelson_or_right_comb

type custom_permission_policy = {
  tag : string;
  config_api: address option;
}

type custom_permission_policy_michelson = custom_permission_policy michelson_pair_right_comb

type permissions_descriptor = {
  operator : operator_transfer_policy;
  receiver : owner_hook_policy;
  sender : owner_hook_policy;
  custom : custom_permission_policy option;
}

type permissions_descriptor_aux = {
  operator : operator_transfer_policy_michelson;
  receiver : owner_hook_policy_michelson;
  sender : owner_hook_policy_michelson;
  custom : custom_permission_policy_michelson option;
}

type permissions_descriptor_michelson = permissions_descriptor_aux michelson_pair_right_comb

(* permissions descriptor entry point
type fa2_entry_points_custom =
  ...
  | Permissions_descriptor of permissions_descriptor_michelson contract

*)


type transfer_destination_descriptor = {
  to_ : address option;
  token_id : token_id;
  amount : nat;
}

type transfer_destination_descriptor_michelson =
  transfer_destination_descriptor michelson_pair_right_comb

type transfer_descriptor = {
  from_ : address option;
  txs : transfer_destination_descriptor list
}

type transfer_descriptor_aux = {
  from_ : address option;
  txs : transfer_destination_descriptor_michelson list
}

type transfer_descriptor_michelson = transfer_descriptor_aux michelson_pair_right_comb

type transfer_descriptor_param = {
  batch : transfer_descriptor list;
  operator : address;
}

type transfer_descriptor_param_aux = {
  batch : transfer_descriptor_michelson list;
  operator : address;
}

type transfer_descriptor_param_michelson = transfer_descriptor_param_aux michelson_pair_right_comb
(*
Entry points for sender/receiver hooks

type fa2_token_receiver =
  ...
  | Tokens_received of transfer_descriptor_param_michelson

type fa2_token_sender =
  ...
  | Tokens_sent of transfer_descriptor_param_michelson
*)

#endif
