
#include "fa2_multi_nft_token.mligo"
#include "fa2_multi_nft_manager.mligo"
#include "../../fa2_modules/simple_admin.mligo"

type nft_asset_storage = {
  assets : nft_token_storage;
  admin : simple_admin_storage;
  metadata: (string, bytes) big_map; (* contract metadata *)
}

type nft_asset_entrypoints =
  | Assets of fa2_entry_points
  | Mint of mint_tokens_param
  | Admin of simple_admin

let nft_asset_main (param, storage : nft_asset_entrypoints * nft_asset_storage)
    : operation list * nft_asset_storage =
  match param with
  | Assets fa2 ->
    let u = fail_if_paused(storage.admin) in
    let ops, new_assets = fa2_main (fa2, storage.assets) in
    let new_storage = { storage with assets = new_assets; } in
    ops, new_storage

  | Mint mp ->
    let u = fail_if_not_admin storage.admin in
    let ops, new_assets = mint_tokens (mp, storage.assets) in
    let new_storage = { storage with assets = new_assets;} in
    ops, new_storage

  | Admin a ->
    let ops, admin = simple_admin (a, storage.admin) in
    let new_storage = { storage with admin = admin; } in
    ops, new_storage

#if !OWNER_HOOKS

let sample_storage : nft_asset_storage = {
  assets = {
    ledger = (Big_map.empty : ledger);
    token_metadata = (Big_map.empty : nft_meta);
    next_token_id = 0n;
    operators = (Big_map.empty : operator_storage);
  };
  admin = {
    admin = ("tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU" : address);
    pending_admin = (None : address option);
    paused = true;
    };
  metadata = (Big_map.empty : (string, bytes) big_map);
}

#endif
