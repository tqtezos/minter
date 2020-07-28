(** 
Optional FA2 contract entry point to setup a transfer hook contract.
Transfer hook is one recommended design pattern to implement FA2 that enables
separation of the core token transfer logic and a permission policy. Instead of
implementing FA2 as a monolithic contract, a permission policy can be implemented
as a separate contract. Permission policy contract provides an entry point invoked
by the core FA2 contract to accept or reject a particular transfer operation (such
an entry point is called transfer hook)
 *)

#if !FA2_HOOK
#define FA2_HOOK

#include "fa2_interface.mligo"


type set_hook_param = {
  hook : unit -> transfer_descriptor_param_michelson contract;
  permissions_descriptor : permissions_descriptor;
}

type set_hook_param_aux = {
  hook : unit -> transfer_descriptor_param_michelson contract;
  permissions_descriptor : permissions_descriptor_michelson;
}

type set_hook_param_michelson = set_hook_param_aux michelson_pair_right_comb

type fa2_with_hook_entry_points =
  | Set_transfer_hook of set_hook_param_michelson

#endif
