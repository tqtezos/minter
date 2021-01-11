import { $log } from '@tsed/logger';
import { BigNumber } from 'bignumber.js';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

import { bootstrap, TestTz } from '../bootstrap-sandbox';
import { Contract, nat, address, bytes } from '../../src/type-aliases';

import {
    originateNftFaucet,
    originateNft,
    MintNftParam,
    SaleParamTez,
    originateFixedPriceTezSale
} from '../../src/nft-contracts-tzip16';
import {
    BalanceOfRequest,
    transfer,
    addOperator,
    removeOperator
} from '../../src/fa2-tzip16-compat-interface';
import { originateInspector, queryBalances } from '../fa2-balance-inspector';

jest.setTimeout(180000); // 3 minutes

const nat1 = new BigNumber(1);

describe.each([originateNftFaucet /*, originateNft*/])(
    'test NFT',
    createNft => {
        let tezos: TestTz;
        let nft: Contract;
        let inspector: Contract;
        let marketplace: Contract;
        let marketAddress: address;

        beforeAll(async () => {
            tezos = await bootstrap();
            inspector = await originateInspector(tezos.bob);
        });

        beforeEach(async () => {
            const admin = await tezos.bob.signer.publicKeyHash();
            nft = await createNft(tezos.bob, admin);
            marketplace = await originateFixedPriceTezSale(tezos.bob);
            marketAddress = marketplace.address;
        });

        async function hasTokens(requests: BalanceOfRequest[]): Promise<boolean[]> {
            const responses = await queryBalances(inspector, nft.address, requests);
            const results = responses.map(r => {
                if (r.balance.eq(1)) return true;
                else if (r.balance.eq(0)) return false;
                else throw new Error(`Invalid NFT balance ${r.balance}`);
            });
            return results;
        }

        // async function startSale(
        //     tz: TezosToolkit,
        //     saleParam: SaleParamTez
        // ): Promise<void> {
        //     $log.info('starting sale...');
        //     const op = await marketplace.methods.sell(saleParam).send();
        //     const hash = await op.confirmation();
        //     $log.info(`consumed gas: ${op.consumedGas}`);
        // }

        async function mintTokens(
            tz: TezosToolkit,
            tokens: MintNftParam[]
        ): Promise<void> {
            $log.info('minting...');
            const op = await nft.methods.mint(tokens).send();
            const hash = await op.confirmation();
            $log.info(`Minted tokens. Consumed gas: ${op.consumedGas}`);
        }


        test('bob makes sale, alice buys', async () => {
            const aliceAddress = await tezos.alice.signer.publicKeyHash();
            const bobAddress = await tezos.bob.signer.publicKeyHash();
            const tokenId = new BigNumber(0);
            const empty_metadata_map: MichelsonMap<string, bytes> = new MichelsonMap();

            await mintTokens(tezos.bob, [
                {
                    token_metadata: {
                        token_id: tokenId,
                        token_metadata_map: empty_metadata_map,
                    },
                    owner: bobAddress
                }
            ]);

            const [aliceHasATokenBefore, bobHasATokenBefore] = await hasTokens([
                { owner: aliceAddress, token_id: tokenId },
                { owner: bobAddress, token_id: tokenId }
            ]);
            expect(aliceHasATokenBefore).toBe(false);
            expect(bobHasATokenBefore).toBe(true);

            const [marketHasATokenBeforeSaleInitiate, bobHasATokenBeforeSaleInitiate] = await hasTokens([
                { owner: marketAddress, token_id: tokenId },
                { owner: bobAddress, token_id: tokenId }
            ]);

            expect(marketHasATokenBeforeSaleInitiate).toBe(false);
            expect(bobHasATokenBeforeSaleInitiate).toBe(true);

            const sell_sale_price: BigNumber = new BigNumber(1000000);
            const sell_token_for_sale_address: address = nft.address;
            const sell_token_for_sale_token_id: nat = tokenId;

            await addOperator(nft.address, tezos.bob, marketAddress, tokenId);

            $log.info('starting sale...');
            const opSell =
                await marketplace.methods.sell(sell_sale_price, sell_token_for_sale_address, sell_token_for_sale_token_id).send({ source: bobAddress, amount: 0 });
            const hashSell = await opSell.confirmation();
            $log.info(`consumed gas: ${opSell.consumedGas}`);

            const [marketHasATokenAfterSaleInitiate, bobHasATokenAfterSaleInitiate] = await hasTokens([
                { owner: marketAddress, token_id: tokenId },
                { owner: bobAddress, token_id: tokenId }
            ]);
            expect(marketHasATokenAfterSaleInitiate).toBe(true);
            expect(bobHasATokenAfterSaleInitiate).toBe(false);

            const [marketHasATokenBeforeBuy, bobHasATokenBeforeBuy, aliceHasATokenBeforeBuy] = await hasTokens([
                { owner: marketAddress, token_id: tokenId },
                { owner: bobAddress, token_id: tokenId },
                { owner: aliceAddress, token_id: tokenId }
            ]);

            expect(marketHasATokenBeforeBuy).toBe(true);
            expect(bobHasATokenBeforeBuy).toBe(false);
            expect(aliceHasATokenBeforeBuy).toBe(false);

            const buy_sale_price: BigNumber = new BigNumber(1000000);
            const buy_token_for_sale_address: address = nft.address;
            const buy_token_for_sale_token_id: nat = tokenId;

            $log.info('alice buys nft...');
            const opBuy =
                await marketplace.methods.buy(buy_sale_price, buy_token_for_sale_address, buy_token_for_sale_token_id).send({ source: aliceAddress, amount: 1 });
            const hashBuy = await opBuy.confirmation();
            $log.info(`consumed gas: ${opBuy.consumedGas}`);

            const [marketHasATokenAfterBuy, bobHasATokenAfterBuy, aliceHasATokenAfterBuy] = await hasTokens([
                { owner: marketAddress, token_id: tokenId },
                { owner: bobAddress, token_id: tokenId },
                { owner: aliceAddress, token_id: tokenId }
            ]);

            expect(marketHasATokenAfterBuy).toBe(false);
            expect(bobHasATokenAfterBuy).toBe(false);
            expect(aliceHasATokenAfterBuy).toBe(true);

        });

    });
