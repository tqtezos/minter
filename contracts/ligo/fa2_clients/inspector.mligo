(** Helper contract to query FA2 `Balance_of` entry point *)
#include "../fa2/lib/fa2_convertors.mligo"

type storage =
  | State of balance_of_response
  | Empty

type query_param = {
  fa2 : address;
  request : balance_of_request_michelson;
}

type param =
  | Query of query_param
  | Response of balance_of_response_michelson list
  | Default of unit

let main (p, s : param * storage) : (operation list) * storage =
  match p with

  | Query q ->
    (* preparing balance_of request and invoking FA2 *)
    let aux : balance_of_param_aux = {
      requests = [ q.request ];
      callback =
        (Operation.get_entrypoint "%response" Current.self_address :
          (balance_of_response_michelson list) contract);
    } in
    let bpm = Layout.convert_to_right_comb aux in
    let fa2 : balance_of_param_michelson contract = 
      Operation.get_entrypoint "%balance_of" q.fa2 in
    let q_op = Operation.transaction bpm 0mutez fa2 in
    [q_op], s

  | Response responses_michelson ->
    (* 
    getting FA2 balance_of_response and putting it into storage
    for off-chain inspection
    *)
    let responses = List.map
      (fun (rm : balance_of_response_michelson) ->
        balance_of_response_from_michelson rm
      )
      responses_michelson
    in
    let new_s = 
      match responses with 
      | b :: tl -> b
      | [] -> (failwith "invalid response" : balance_of_response)
    in
    ([] : operation list), State new_s

  | Default u -> ([] : operation list), s
