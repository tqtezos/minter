import { $log } from '@tsed/logger';
import { BigNumber } from 'bignumber.js';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';

import { bootstrap, TestTz } from './bootstrap-sandbox';
import { Contract, address, bytes } from '../src/type-aliases';

import {
    originateNftFaucet,
    MintNftParam,
    originateFixedPriceTezSale
} from '../src/nft-contracts';
import {
    BalanceOfRequest,
    addOperator
} from '../src/fa2-interface';
import { originateInspector, queryBalances } from './fa2-balance-inspector';

jest.setTimeout(180000); // 3 minutes

describe.each([originateFixedPriceTezSale])
    ('marketplace test', (originateMarketplace) => {
        let tezos: TestTz;
        let nft: Contract;
        let inspector: Contract;
        let marketplace: Contract;
        let marketAddress: address;
        let bobAddress: address;
        let aliceAddress: address
        let tokenId: BigNumber;
        let tokenMetadata: MichelsonMap<string, bytes>;
        let salePrice: BigNumber;

        beforeAll(async () => {
            tezos = await bootstrap();
            inspector = await originateInspector(tezos.bob);
        });

        beforeEach(async () => {
            const admin = await tezos.bob.signer.publicKeyHash();
            nft = await originateNftFaucet(tezos.bob, admin);
            marketplace = await originateMarketplace(tezos.bob);
            marketAddress = marketplace.address;
            aliceAddress = await tezos.alice.signer.publicKeyHash();
            bobAddress = await tezos.bob.signer.publicKeyHash();
            tokenId = new BigNumber(0);
            tokenMetadata = new MichelsonMap();
            salePrice = new BigNumber(1000000);
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

        async function mintTokens(
            tz: TezosToolkit,
            tokens: MintNftParam[],
        ): Promise<void> {
            $log.info('minting...');
            const op = await nft.methods.mint(tokens).send();
            const hash = await op.confirmation();
            $log.info(`Minted tokens. Consumed gas: ${op.consumedGas}`);
        }

        test('bob makes sale, and alice buys nft', async () => {

            await mintTokens(tezos.bob, [
                {
                    token_metadata: {
                        token_id: tokenId,
                        token_info: tokenMetadata,
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

            $log.info('making marketplace an operator of bob\'s token');
            await addOperator(nft.address, tezos.bob, marketAddress, tokenId);

            try {
                $log.info('starting sale...');
                const bobSaleContract = await tezos.bob.contract.at(marketplace.address);
                const sellOp = await bobSaleContract.methods.sell(salePrice, nft.address, tokenId).send({ source: bobAddress, amount: 0 });
                $log.info(`Waiting for ${sellOp.hash} to be confirmed...`);
                const sellOpHash = await sellOp.confirmation(1).then(() => sellOp.hash);
                $log.info(`Operation injected at hash=${sellOpHash}`);
                $log.info('alice buys nft...');


                const aliceSaleContract = await tezos.alice.contract.at(marketplace.address);
                const buyOp = await aliceSaleContract.methods.buy(bobAddress, nft.address, tokenId).send({ source: aliceAddress, amount: 1 });
                $log.info(`Waiting for ${buyOp.hash} to be confirmed...`);
                const buyOpHash = await buyOp.confirmation().then(() => buyOp.hash);
                $log.info(`Operation injected at hash=${buyOpHash}`);

            } catch (error) {
                $log.info(`Error: ${JSON.stringify(error, null, 2)}`);
            }


        });

        test('bob makes sale, cancels it, then alice unsuccessfully tries to buy', async () => {

            await mintTokens(tezos.bob, [
                {
                    token_metadata: {
                        token_id: tokenId,
                        token_info: tokenMetadata,
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

            $log.info('making marketplace an operator of bob\'s token');
            await addOperator(nft.address, tezos.bob, marketAddress, tokenId);

            try {
                $log.info('starting sale...');
                const bobSaleContract = await tezos.bob.contract.at(marketplace.address);
                const sellOp = await bobSaleContract.methods.sell(salePrice, nft.address, tokenId).send({ source: bobAddress, amount: 0 });
                $log.info(`Waiting for ${sellOp.hash} to be confirmed...`);
                const sellOpHash = await sellOp.confirmation(1).then(() => sellOp.hash);
                $log.info(`Operation injected at hash=${sellOpHash}`);
                $log.info('bob cancels sale');
                const removeSaleOp = await bobSaleContract.methods.cancel(salePrice, nft.address, tokenId).send({ source: bobAddress, amount: 0 });
                $log.info(`Waiting for ${removeSaleOp.hash} to be confirmed...`);
                const removeSaleOpHash = await removeSaleOp.confirmation(1).then(() => removeSaleOp.hash);
                $log.info(`Operation injected at hash=${removeSaleOpHash}`);
                $log.info(`alice tries to buy`);
                const aliceSaleContract = await tezos.alice.contract.at(marketplace.address);
                const buyOp = await aliceSaleContract.methods.buy(bobAddress, nft.address, tokenId).send({ source: aliceAddress, amount: 1 });
            } catch (error) {
                $log.info(`alice couldn't buy`);
            }

        });

    });
