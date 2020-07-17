#include "fa2_multi_nft_manager.mligo"
#include "../fa2_modules/simple_admin.mligo"

type minter_storage = {
  admin : simple_admin_storage;
  last_fa2_nft : address option;
  last_created_token_ids : token_id list
}

type minter_param = {
  fa2_nft : address;
  tokens : token_metadata_mint list;
}

type set_admin_param = {
  fa2 : address;
  new_admin : address;
}

type minter_entrypoints =
 | Admin of simple_admin
 | Set_fa2_admin of set_admin_param
 | Mint of minter_param
 | Minted of token_id list


let create_minted_callback (callback_address : address) : minted_callback =
  let minted_callback_opt : minted_callback  option =
      Operation.get_entrypoint_opt "%minted" callback_address in 
  match minted_callback_opt with
  | None -> (failwith "NO_MINTED_ENTRYPOINT" : minted_callback)
  | Some callback -> callback

let create_mint_op (param, mint_address : mint_tokens_param * address) : operation =
  let mint : mint_tokens_param contract option =
    Operation.get_entrypoint_opt "%mint" mint_address in
  match mint with
  | None -> (failwith "NO_MINT_ENTRY_POINT" : operation)
  | Some c -> Operation.transaction param 0mutez c

let create_set_admin_op (p : set_admin_param) : operation =
  let set_admin_opt : address contract option =
    Operation.get_entrypoint_opt "%set_admin" p.fa2 in
  match set_admin_opt with
  | None -> (failwith "NO_SET_ADMIN_ENTRY_POINT" : operation)
  | Some c -> Operation.transaction p.new_admin 0mutez c


type return_type = operation list * minter_storage

let minter_main(param, storage : minter_entrypoints * minter_storage)
    : return_type =
  match param with
  | Admin a -> 
    let ops, admin = simple_admin (a, storage.admin) in
    let new_storage = { storage with admin = admin; } in
    ops, new_storage

  | Set_fa2_admin p ->
    let u = fail_if_not_admin storage.admin in
    let set_admin_op = create_set_admin_op p in
    [set_admin_op], storage

  | Mint p ->
    let u = fail_if_not_admin storage.admin in
    let new_storage = { storage with 
      last_fa2_nft = Some p.fa2_nft;
      last_created_token_ids = ([] : token_id list)
    } in
    let minted_callback = create_minted_callback Tezos.self_address in
    let mint_tokens_param : mint_tokens_param = {
      tokens = p.tokens;
      callback = minted_callback;
    } in
    let mint_op = create_mint_op (mint_tokens_param, p.fa2_nft) in
    [mint_op], new_storage

  | Minted tokens ->
    (
    match storage.last_fa2_nft with
    | None -> (failwith "NO_MINT_IN_PROGRESS" : return_type)
    | Some fa2_nft ->
      if fa2_nft <> Tezos.sender
      then (failwith "INVALID_CALLBACK_SENDER" : return_type)
      else
        let new_storage = { storage with last_created_token_ids = tokens; } in
        ([] : operation list), new_storage
    )
    
let sample_storage : minter_storage = {
  admin = {
    admin = ("tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU" : address);
    pending_admin = (None : address option);
    paused = true;
  };
  last_fa2_nft = (None : address option); 
  last_created_token_ids = ([] : token_id list);
}