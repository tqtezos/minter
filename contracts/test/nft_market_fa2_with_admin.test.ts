import { $log } from '@tsed/logger';
import { BigNumber } from 'bignumber.js';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';

import { adminBootstrap, bootstrap, TestTz } from './bootstrap-sandbox';
import { Contract, address, bytes } from '../src/type-aliases';
import { Signer } from '@taquito/taquito/dist/types/signer/interface';

import {
    originateNftFaucet,
    originateFtFaucet,
    MintNftParam,
    MintFtParam,
    originateFixedPriceAdminSale
} from '../src/nft-contracts';
import {
    BalanceOfRequest,
    addOperator,
    TokenMetadata,
    transfer
} from '../src/fa2-interface';
import { originateInspector, queryBalances } from './fa2-balance-inspector';

jest.setTimeout(180000); // 3 minutes


describe.each([originateFixedPriceAdminSale])
    ('marketplace test', (originateMarketplace) => {
        let tezos: TestTz;
        let nft: Contract;
        let ft: Contract;
        let inspector: Contract;
        let marketplace: Contract;
        let marketAddress: address;
        let bobAddress: address;
        let aliceAddress: address
        let ftTokenId: BigNumber;
        let nftTokenId: BigNumber;
        let tokenMetadata: MichelsonMap<string, bytes>;
        let salePrice: BigNumber;
        let adminAddress: address;
        let adminToolkit: TezosToolkit;

        beforeAll(async () => {
            tezos = await bootstrap();
            inspector = await originateInspector(tezos.bob);
            adminToolkit = await adminBootstrap();
            adminAddress = await adminToolkit.signer.publicKeyHash();
        });

        beforeEach(async () => {
            nft = await originateNftFaucet(adminToolkit, adminAddress);
            ft = await originateFtFaucet(adminToolkit, adminAddress);
            marketplace = await originateMarketplace(tezos.bob, adminAddress);
            marketAddress = marketplace.address;
            aliceAddress = await tezos.alice.signer.publicKeyHash();
            bobAddress = await tezos.bob.signer.publicKeyHash();
            nftTokenId = new BigNumber(0);
            ftTokenId = new BigNumber(5);
            tokenMetadata = new MichelsonMap();
            salePrice = new BigNumber(1000000);
        });

        async function hasNftTokens(requests: BalanceOfRequest[]): Promise<boolean[]> {
            const responses = await queryBalances(inspector, nft.address, requests);
            const results = responses.map(r => {
                if (r.balance.eq(1)) return true;
                else if (r.balance.eq(0)) return false;
                else throw new Error(`Invalid NFT balance ${r.balance}`);
            });
            return results;
        }

        async function hasFtTokens(requests: BalanceOfRequest[]): Promise<boolean[]> {
            const responses = await queryBalances(inspector, ft.address, requests);
            const results = responses.map(r => {
                if (r.balance.gt(0)) return true;
                else if (r.balance.eq(0)) return false;
                else throw new Error(`Invalid FT balance ${r.balance}`);
            });
            return results;
        }

        async function mintNftTokens(
            tz: TezosToolkit,
            tokens: MintNftParam[],
        ): Promise<void> {
            $log.info('minting...');
            const op = await nft.methods.mint(tokens).send();
            const hash = await op.confirmation();
            $log.info(`Minted non-fungible tokens. Consumed gas: ${op.consumedGas}`);
        }

        async function mintFtTokens(
            tz: TezosToolkit,
            tokens: MintFtParam[],
        ): Promise<void> {
            $log.info('minting...');
            const op = await ft.methods.mint_tokens(tokens).send();
            const hash = await op.confirmation();
            $log.info(`Minted fungible tokens. Consumed gas: ${op.consumedGas}`);
        }

        async function createFtToken(
            tz: TezosToolkit,
            token_metadata: TokenMetadata,
        ): Promise<void> {
            $log.info('minting...');
            const op =
                await ft.methods.create_token(token_metadata.token_id,token_metadata.token_metadata_map).send();
            const hash = await op.confirmation();
            $log.info(`Created fungible token. Consumed gas: ${op.consumedGas}`);
        }

        test('bob makes sale, and alice buys nft', async () => {

            // $log.info(`bruh`);
            // let methods = ft.parameterSchema.ExtractSignatures();
            // $log.info(`Error: ${JSON.stringify(methods, null, 2)}`);

            await createFtToken(tezos.alice, { token_id : ftTokenId, token_metadata_map: tokenMetadata, });
            await mintFtTokens(tezos.alice, [
                {

                    token_id: ftTokenId,
                    owner: aliceAddress,
                    amount: new BigNumber(1000)
                }
            ]);

            const [aliceHasFTTokenBefore, bobHasFTTokenBefore] = await hasFtTokens([
                { owner: aliceAddress, token_id: ftTokenId },
                { owner: bobAddress, token_id: ftTokenId }
            ]);

            expect(aliceHasFTTokenBefore).toBe(true);
            expect(bobHasFTTokenBefore).toBe(false);

            await mintNftTokens(tezos.bob, [
                {
                    token_metadata: {
                        token_id: nftTokenId,
                        token_metadata_map: tokenMetadata,
                    },
                    owner: bobAddress
                }
            ]);

            const [aliceHasNFTTokenBefore, bobHasNFTTokenBefore] = await hasNftTokens([
                { owner: aliceAddress, token_id: nftTokenId },
                { owner: bobAddress, token_id: nftTokenId }
            ]);
            expect(aliceHasNFTTokenBefore).toBe(false);
            expect(bobHasNFTTokenBefore).toBe(true);

            $log.info('making marketplace an operator of alice\'s FT tokens');
            await addOperator(ft.address, tezos.alice, marketAddress, ftTokenId);

            $log.info('making marketplace an operator of bob\'s NFT token');
            await addOperator(nft.address, tezos.bob, marketAddress, nftTokenId);

            $log.info('starting sale...');

            $log.info('pause marketplace');
            const pauseOp = await marketplace.methods.pause(true).send({ amount: 0 });
            $log.info(`Waiting for ${pauseOp.hash} to be confirmed...`);
            const pauseOpHash = await pauseOp.confirmation().then(() => pauseOp.hash);
            $log.info(`Operation injected at hash=${pauseOpHash}`);

            try {
                $log.info(`Attempting to create sale while contract is paused`);
                const sellOp = await marketplace.methods.sell(new BigNumber(20) , nft.address, nftTokenId ,ft.address , ftTokenId).send({amount: 0});
            }
            catch (error) {$log.info(`Confirmation: Cannot create sale while contract is paused`);}

            $log.info('unpause marketplace');
            const unpauseOp = await marketplace.methods.pause(false).send({ amount: 0 });
            $log.info(`Waiting for ${unpauseOp.hash} to be confirmed...`);
            const unpauseOpHash = await unpauseOp.confirmation().then(() => unpauseOp.hash);
            $log.info(`Operation injected at hash=${unpauseOpHash}`);

            $log.info(`Creating sale`);
            const sellOp = await marketplace.methods.sell(new BigNumber(20), nft.address, nftTokenId, ft.address, ftTokenId).send({source: bobAddress, amount: 0});
            $log.info(`Waiting for ${sellOp.hash} to be confirmed...`);
            const sellOpHash = await sellOp.confirmation().then(() => sellOp.hash);
            $log.info(`Operation injected at hash=${sellOpHash}`);

            const aliceSaleContract = await tezos.alice.contract.at(marketplace.address);

            $log.info(`Alice buys non-fungible token with her fungible tokens`);
            const buyOp = await aliceSaleContract.methods.buy(bobAddress, nft.address, nftTokenId, ft.address, ftTokenId).send({source:aliceAddress, amount: 0});
            $log.info(`Waiting for ${buyOp.hash} to be confirmed...`);
            const buyOpHash = await buyOp.confirmation().then(() => buyOp.hash);
            $log.info(`Operation injected at hash=${buyOpHash}`);

        })

        test.only('bob makes sale, cancels it, then alice unsuccessfully tries to buy', async () => {


            await createFtToken(tezos.alice, { token_id : ftTokenId, token_metadata_map: tokenMetadata, });
            await mintFtTokens(tezos.alice, [
                {

                    token_id: ftTokenId,
                    owner: aliceAddress,
                    amount: new BigNumber(1000)
                }
            ]);

            await mintNftTokens(tezos.bob, [
                {
                    token_metadata: {
                        token_id: nftTokenId,
                        token_metadata_map: tokenMetadata,
                    },
                    owner: bobAddress
                }
            ]);


            $log.info('making marketplace an operator of bob\'s token');
            await addOperator(nft.address, tezos.bob, marketAddress, nftTokenId);

            $log.info('making marketplace an operator of alice\'s FT tokens');
            await addOperator(ft.address, tezos.alice, marketAddress, ftTokenId);

            $log.info(`Creating sale`);
            const sellOp = await marketplace.methods.sell(new BigNumber(20), nft.address, nftTokenId, ft.address, ftTokenId).send({source: bobAddress, amount: 0});
            $log.info(`Waiting for ${sellOp.hash} to be confirmed...`);
            const sellOpHash = await sellOp.confirmation().then(() => sellOp.hash);
            $log.info(`Operation injected at hash=${sellOpHash}`);

            try {
                $log.info('alice cancels sale (not admin nor seller)');
                const removeSaleOp = await marketplace.methods.cancel(aliceAddress, nft.address, nftTokenId, ft.address, ftTokenId).send({source:aliceAddress, amount: 0 });
            } catch (error) {
                $log.info(`Alice cannot cancel sale, since she is not admin`);
            }

            $log.info('bob cancels sale');
            const removeSaleOp = await marketplace.methods.cancel(bobAddress, nft.address, nftTokenId, ft.address, ftTokenId).send({source:bobAddress, amount: 0 });
            $log.info(`Waiting for ${removeSaleOp.hash} to be confirmed...`);
            const removeSaleOpHash = await removeSaleOp.confirmation().then(() => removeSaleOp.hash);
            $log.info(`Operation injected at hash=${removeSaleOpHash}`);

            const aliceSaleContract = await tezos.alice.contract.at(marketplace.address);

            try {
                $log.info(`Alice buys non-fungible token with her fungible tokens`);
                const buyOp = await aliceSaleContract.methods.buy(bobAddress, nft.address, nftTokenId, ft.address, ftTokenId).send({source:aliceAddress, amount: 0});
            } catch (error) {
                $log.info(`alice cannot buy`);
            }

        })

    });
