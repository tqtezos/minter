#define OWNER_HOOKS

#include "fa2_multi_nft_asset.mligo"
#include "fa2_multi_nft_manager.mligo"
#include "../fa2_modules/simple_admin.mligo"


type nft_asset_with_hooks_entrypoints =
  | Nft_asset of nft_asset_entrypoints
  | Permissions_descriptor of permissions_descriptor contract 


let nft_asset_main_with_hooks (param, storage
    : nft_asset_with_hooks_entrypoints * nft_asset_storage)
    : operation list * nft_asset_storage =
  match param with
  | Nft_asset p -> nft_asset_main (p, storage)

  | Permissions_descriptor callback ->
    let callback_op =
      Operation.transaction storage.assets.permissions_descriptor 0mutez callback in
    [callback_op], storage

let sample_storage : nft_asset_storage = {
  assets = {
    ledger = (Big_map.empty : ledger);
    token_metadata = (Big_map.empty : nft_meta);
    next_token_id = 0n;
    operators = (Big_map.empty : operator_storage);
    permissions_descriptor = {
            operator = Owner_or_operator_transfer;
            receiver = Optional_owner_hook;
            sender = Optional_owner_hook;
            custom = (None : custom_permission_policy option);
          };
  };
  admin = {
    admin = ("tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU" : address);
    pending_admin = (None : address option);
    paused = true;
  };
}