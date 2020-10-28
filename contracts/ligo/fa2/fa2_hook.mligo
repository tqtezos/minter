(** 
Optional FA2 contract entrypoint to setup a transfer hook contract.
Transfer hook is one recommended design pattern to implement FA2 that enables
separation of the core token transfer logic and a permission policy. Instead of
implementing FA2 as a monolithic contract, a permission policy can be implemented
as a separate contract. Permission policy contract provides an entrypoint invoked
by the core FA2 contract to accept or reject a particular transfer operation (such
an entrypoint is called transfer hook)
 *)

#if !FA2_HOOK
#define FA2_HOOK

#include "fa2_interface.mligo"


type set_hook_param =
[@layout:comb]
{
  hook : unit -> transfer_descriptor_param contract;
  permissions_descriptor : permissions_descriptor;
}

type fa2_with_hook_entry_points =
  | Set_transfer_hook of set_hook_param

#endif
