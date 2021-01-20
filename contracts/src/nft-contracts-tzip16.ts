import { $log } from '@tsed/logger';

import { compileAndLoadContract, originateContract, defaultEnv } from './ligo';
import { Contract, address, nat } from './type-aliases';
import { TezosToolkit } from '@taquito/taquito';
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

export async function originateFixedPriceSale(
    tz: TezosToolkit,
    admin: address
): Promise<Contract> {
    const code = await compileAndLoadContract(
        defaultEnv,
        'fixed_price_sale_market.mligo',
        'fixed_price_sale_main',
        'fixed_price_sale_market.tz',
    );
    const storage = `{}`;
    return originateContract(tz, code, storage, 'fixed-price-sale-market');
}

export async function originateFixedPriceTezSale(
    tz: TezosToolkit,
): Promise<Contract> {
    const code = await compileAndLoadContract(
        defaultEnv,
        'fixed_price_sale_market_tez.mligo',
        'fixed_price_sale_tez_main',
        'fixed_price_sale_market_tez.tz',
    );
    const storage = `{}`;
    return originateContract(tz, code, storage, 'fixed-price-sale-market-tez');
}
