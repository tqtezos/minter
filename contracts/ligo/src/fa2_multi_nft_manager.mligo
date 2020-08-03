#if !FA2_MULTI_NFT_MINTER

#define FA2_MULTI_NFT_MINTER

#include "fa2_multi_nft_token.mligo"

type token_metadata_mint = {
  symbol : string;
  name : string;
  extras : (string, string) map;
  owner : address;
}

type minted_callback = token_id list contract

type mint_tokens_param = {
  tokens : token_metadata_mint list;
  callback : minted_callback;
}


type minted1 = {
  storage : nft_token_storage;
  reversed_txs : transfer_destination_descriptor list;
}

let update_meta_and_create_txs (param, storage 
    : mint_tokens_param * nft_token_storage) : minted1 =
  let seed1 : minted1 = { 
    storage = storage; 
    reversed_txs = ([] : transfer_destination_descriptor list);
  } in
  List.fold
    (fun (acc, t : minted1 * token_metadata_mint) ->
      let meta : token_metadata = {
        token_id = acc.storage.next_token_id;
        symbol = t.symbol;
        name = t.name;
        decimals = 0n;
        extras = t.extras;
      } in
      let meta_michelson : token_metadata_michelson =
        Layout.convert_to_right_comb (meta : token_metadata) in
      let new_token_metadata =
        Big_map.add meta.token_id meta_michelson acc.storage.token_metadata in

      let new_storage = { acc.storage with
        token_metadata = new_token_metadata;
        next_token_id = acc.storage.next_token_id + 1n;
      } in

      let tx : transfer_destination_descriptor = {
        to_ = Some t.owner;
        token_id = meta.token_id;
        amount = 1n;
      } in

      {
        storage = new_storage;
        reversed_txs = tx :: acc.reversed_txs;
      }
    ) param.tokens seed1

type minted2 = {
  txs : transfer_destination_descriptor list;
  new_tokens : token_id list;
}

let prepare_tx_and_token_lists (reversed_txs : transfer_destination_descriptor list)
    : minted2 =
  (* reverse tx destination list and form alist of token ids for callback *)
  let seed2 : minted2 = {
    txs = ([] : transfer_destination_descriptor list);
    new_tokens = ([] : token_id list);
  } in
  List.fold
    (fun (acc, t : minted2 * transfer_destination_descriptor) -> 
      {txs = t :: acc.txs; new_tokens = t.token_id :: acc.new_tokens; }
    ) 
    reversed_txs seed2

let mint_tokens (param, storage : mint_tokens_param * nft_token_storage)
    : operation list * nft_token_storage =
  let mint1 = update_meta_and_create_txs (param, storage) in
  let mint2 = prepare_tx_and_token_lists mint1.reversed_txs in
  (* update ledger *)
  let tx_descriptor : transfer_descriptor = {
    from_ = (None : address option);
    txs = mint2.txs;
  } in
  let nop_operator_validator = fun (p : address * operator_storage) -> unit in
  let ops, new_storage =
    fa2_transfer ([tx_descriptor], nop_operator_validator, mint1.storage) in 
  let callback_op = Operation.transaction mint2.new_tokens 0mutez param.callback in
  callback_op :: ops, new_storage
  (* ([] : operation list), mint1.storage *)
  


#endif