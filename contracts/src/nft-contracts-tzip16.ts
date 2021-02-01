import { $log } from '@tsed/logger';

import { compileAndLoadContract, originateContract, defaultEnv } from './ligo';
import { Contract, address, nat } from './type-aliases';
import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { TokenMetadata } from './fa2-tzip16-compat-interface';
import { BigNumber } from 'bignumber.js';

export interface MintNftParam {
  token_metadata: TokenMetadata;
  owner: address;
}

export interface SaleTokenParamTez {
  token_for_sale_address: address;
  token_for_sale_token_id: nat;
}

export interface SaleParamTez {
  sale_price: BigNumber;
  sale_token: SaleTokenParamTez;
}

interface AdminStorage {
  admin: string;
  pending_admin?: string;
  paused: boolean;
}

export async function originateNft(
  tz: TezosToolkit,
  admin: address
): Promise<Contract> {
  const code = await compileAndLoadContract(
    defaultEnv,
    'tzip16-compat/fa2_multi_nft_asset.mligo',
    'nft_asset_main',
    'fa2_multi_nft_asset_tzip16_compat.tz'
  );
  const storage = `(Pair (Pair (Pair "${admin}" False) None)
  (Pair (Pair {} 0) (Pair {} {})))`;
  return originateContract(tz, code, storage, 'nft-tzip16-compat');
}

export async function originateNftFactory(tz: TezosToolkit): Promise<Contract> {
  const code = await compileAndLoadContract(
    defaultEnv,
    'tzip16-compat/fa2_nft_factory.mligo',
    'factory_main',
    'fa2_nft_factory_tzip16_compat.tz'
  );
  return originateContract(tz, code, '{}', 'nftFactory-tzip16-compat');
}

export async function originateNftFaucet(
  tz: TezosToolkit,
  admin: address
): Promise<Contract> {
  const code = await compileAndLoadContract(
    defaultEnv,
    'tzip16-compat/fa2_multi_nft_faucet.mligo',
    'nft_faucet_main',
    'fa2_multi_nft_faucet_tzip16_compat.tz'
  );
  const storage = `(Pair (Pair (Pair {} 0) (Pair {} {})) {})`;
  return originateContract(tz, code, storage, 'nftFaucet-tzip16-compat');
}

function toHexString(input: string) {
  return Buffer.from(input).toString('hex');
}

export async function originateNftFaucet2(
  tz: TezosToolkit,
  code: string
): Promise<Contract> {
  const name = 'nft_faucet_main';
  const metadata = new MichelsonMap<string, string>();
  const contents = {
    name: 'Minter',
    description: 'An OpenMinter base collection contract.',
    interfaces: ['TZIP-012', 'TZIP-016', 'TZIP-020'],
    tokenCategory: 'collectibles'
  };
  metadata.set('', toHexString('tezos-storage:contents'));
  metadata.set('contents', toHexString(JSON.stringify(contents)));
  try {
    const originationOp = await tz.contract.originate({
      code: code,
      storage: {
        assets: {
          ledger: new MichelsonMap(),
          next_token_id: 0,
          operators: new MichelsonMap(),
          token_metadata: new MichelsonMap()
        },
        metadata: metadata
      }
    });

    const contract = await originationOp.contract();
    $log.info(`originated contract ${name} with address ${contract.address}`);
    $log.info(`consumed gas: ${originationOp.consumedGas}`);
    return Promise.resolve(contract);
  } catch (error) {
    const jsonError = JSON.stringify(error, null, 2);
    $log.fatal(`${name} origination error ${jsonError}`);
    return Promise.reject(error);
  }
}

export async function originateFixedPriceSale(
  tz: TezosToolkit,
  admin: address
): Promise<Contract> {
  const code = await compileAndLoadContract(
    defaultEnv,
    'fixed_price_sale_market.mligo',
    'fixed_price_sale_main',
    'fixed_price_sale_market.tz'
  );
  const storage = `{}`;
  return originateContract(tz, code, storage, 'fixed-price-sale-market');
}

export async function originateFixedPriceTezSale(
  tz: TezosToolkit
): Promise<Contract> {
  const code = await compileAndLoadContract(
    defaultEnv,
    'fixed_price_sale_market_tez.mligo',
    'fixed_price_sale_tez_main',
    'fixed_price_sale_market_tez.tz'
  );
  const storage = `{}`;
  return originateContract(tz, code, storage, 'fixed-price-sale-market-tez');
}
