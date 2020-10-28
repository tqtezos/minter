(** Helper contract to query FA2 `Balance_of` entry point *)
#include "../fa2/fa2_interface.mligo"

type storage =
  | State of balance_of_response list
  | Empty

type query_param = {
  fa2 : address;
  requests : balance_of_request list;
}

type param =
  | Query of query_param
  | Response of balance_of_response list
  | Default of unit

let main (p, s : param * storage) : (operation list) * storage =
  match p with

  | Query q ->
    (* preparing balance_of request and invoking FA2 *)
    let bp : balance_of_param = {
      requests = q.requests;
      callback =
        (Operation.get_entrypoint "%response" Current.self_address :
          (balance_of_response list) contract);
    } in
    let fa2 : balance_of_param contract = 
      Operation.get_entrypoint "%balance_of" q.fa2 in
    let q_op = Operation.transaction bp 0mutez fa2 in
    [q_op], s

  | Response responses ->
    (* 
    getting FA2 balance_of_response and putting it into storage
    for off-chain inspection
    *)
    ([] : operation list), State responses

  | Default u -> ([] : operation list), s
