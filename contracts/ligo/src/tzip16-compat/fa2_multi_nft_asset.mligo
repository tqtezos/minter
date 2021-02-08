
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
