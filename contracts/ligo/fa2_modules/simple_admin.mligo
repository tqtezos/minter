(*
  One of the possible implementations of admin API for FA2 contract.
  The admin API can change an admin address using two step confirmation pattern and
  pause/unpause the contract. Only current admin can initiate those operations.
  
  Other entry points may guard their access using helper functions
  `fail_if_not_admin` and `fail_if_paused`.
*)

#if !SIMPLE_ADMIN
#define SIMPLE_ADMIN

(* `simple_admin` entry points *)
type simple_admin =
  | Set_admin of address
  | Confirm_admin of unit
  | Pause of bool


type simple_admin_storage = {
  admin : address;
  pending_admin : address option;
  paused : bool;
}

let set_admin (new_admin, s : address * simple_admin_storage) : simple_admin_storage =
  { s with pending_admin = Some new_admin; }

let confirm_new_admin (s : simple_admin_storage) : simple_admin_storage =
  match s.pending_admin with
  | None -> (failwith "NO_PENDING_ADMIN" : simple_admin_storage)
  | Some pending ->
    if Tezos.sender = pending
    then {s with 
      pending_admin = (None : address option);
      admin = Tezos.sender;
    }
    else (failwith "NOT_A_PENDING_ADMIN" : simple_admin_storage)


let pause (paused, s: bool * simple_admin_storage) : simple_admin_storage =
  { s with paused = paused; }

let fail_if_not_admin (a : simple_admin_storage) : unit =
  if sender <> a.admin
  then failwith "NOT_AN_ADMIN"
  else unit

let fail_if_paused (a : simple_admin_storage) : unit =
  if a.paused
  then failwith "PAUSED"
  else unit

let simple_admin (param, s : simple_admin *simple_admin_storage)
    : (operation list) * simple_admin_storage =
  match param with
  | Set_admin new_admin ->
    let u = fail_if_not_admin s in
    let new_s = set_admin (new_admin, s) in
    (([]: operation list), new_s)

  | Confirm_admin u ->
    let new_s = confirm_new_admin s in
    (([]: operation list), new_s)

  | Pause paused ->
    let u = fail_if_not_admin s in
    let new_s = pause (paused, s) in
    (([]: operation list), new_s)

#endif
