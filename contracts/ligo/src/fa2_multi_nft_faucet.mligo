#include "fa2_multi_nft_token.mligo"
#include "fa2_multi_nft_manager.mligo"

type nft_faucet_entrypoints =
  | Assets of fa2_entry_points
  | Mint of mint_tokens_param

let nft_faucet_main (param, storage : nft_faucet_entrypoints * nft_token_storage)
    : operation list * nft_token_storage =
  match param with
  | Assets fa2 -> fa2_main (fa2, storage)
  | Mint mp -> mint_tokens (mp, storage)

let sample_storage : nft_token_storage = {
    ledger = (Big_map.empty : ledger);
    token_metadata = (Big_map.empty : nft_meta);
    next_token_id = 0n;
    operators = (Big_map.empty : operator_storage);
  }
