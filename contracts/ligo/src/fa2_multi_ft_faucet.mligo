#include "fa2_multi_ft_token.mligo"
#include "fa2_multi_ft_token_manager.mligo"

type ft_faucet_entrypoints =
  | Assets of fa2_entry_points
  | Tokens of token_manager

type ft_faucet_storage = {
    assets: multi_ft_token_storage;
    metadata: (string, bytes) big_map;
}


let ft_faucet_main
    (param, s : ft_faucet_entrypoints * ft_faucet_storage)
    : (operation list) * ft_faucet_storage =
  match param with
  | Tokens p ->

      let ops, assets = ft_token_manager (p, s.assets) in
      let new_s = { s with
        assets = assets
      } in
      (ops, new_s)

  | Assets p ->

      let ops, assets = fa2_main (p, s.assets) in
      let new_s = { s with assets = assets } in
      (ops, new_s)
