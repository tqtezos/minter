#if !FA2_MULTI_NFT_MINTER

#define FA2_MULTI_NFT_MINTER

#include "fa2_multi_nft_token.mligo"

type token_metadata_mint = {
  symbol : string;
  name : string;
  extras : (string, string) map;
  owner : address;
}

type mint_token_param = {
  tokens : token_metadata_mint list;
  callback : token_id list contract;
}


type minted = {
  storage : nft_token_storage;
  reversed_new_token_ids : token_id list;
}

let mint_tokens (param, storage : mint_token_param * nft_token_storage)
    : operation list * nft_token_storage =
  let seed : minted = { 
    storage = storage; 
    reversed_new_token_ids = ([] : token_id list);
  } in
  let minted : minted = List.fold
    (fun (acc, t : minted * token_metadata_mint) ->
      let meta : token_metadata = {
        token_id = acc.storage.next_token_id;
        symbol = t.symbol;
        name = t.name;
        decimals = 0n;
        extras = t.extras;
      } in
      let meta_michelson : token_metadata_michelson =
        Layout.convert_to_right_comb meta in
      let new_token_metadata =
        Big_map.add meta.token_id meta_michelson acc.storage.token_metadata in
      let new_ledger =
        Big_map.add meta.token_id t.owner acc.storage.ledger in
      let new_storage = { acc.storage with
        token_metadata = new_token_metadata;
        ledger = new_ledger;
        next_token_id = acc.storage.next_token_id + 1n;
      } in
      {
        storage = new_storage;
        reversed_new_token_ids = meta.token_id :: acc.reversed_new_token_ids;
      }
    ) param.tokens seed
  in
  let new_tokens = List.fold
    (fun (acc, t : token_id list * token_id) -> t :: acc) 
    minted.reversed_new_token_ids ([] : token_id list) in
  let callback_op = Operation.transaction new_tokens 0mutez param.callback in
  [callback_op], minted.storage
  


#endif