#include "fa2_multi_nft_asset.mligo"

type contract_info = {
  owner: address;
  name: string;
}

type storage = (address, contract_info) big_map

let create_contract : (key_hash option * tez * nft_asset_storage) -> (operation * address) =
  [%Michelson ( {|
    {
        UNPPAIIR ;
        CREATE_CONTRACT
        ${code}
        ;
        PAIR
    }
  |} : (key_hash option * tez * nft_asset_storage) -> (operation * address))]


let factory_main (name, storage : string * storage) : operation list * storage =
  let init_storage : nft_asset_storage = {
    assets = {
      ledger = (Big_map.empty : ledger);
      token_metadata = (Big_map.empty : nft_meta);
      next_token_id = 0n;
      operators = (Big_map.empty : operator_storage);
    };
    admin = {
      admin = Tezos.sender;
      pending_admin = (None : address option);
      paused = false;
    };
    metadata = (Map.empty : (string, bytes) map);
  } in
 let op, fa2_nft = create_contract ((None: key_hash option), 0tez, init_storage) in
 let contract_info = { owner = Tezos.sender; name = name } in
 let new_storage = Big_map.add fa2_nft contract_info storage in
 [op], new_storage
