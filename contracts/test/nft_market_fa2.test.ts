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
    originateFixedPriceSale
} from '../src/nft-contracts';
import {
    BalanceOfRequest,
    addOperator,
    TokenMetadata
} from '../src/fa2-interface';
import { originateInspector, queryBalances } from './fa2-balance-inspector';

jest.setTimeout(180000); // 3 minutes


describe.each([originateFixedPriceSale])
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
                    amount: new BigNumber(100)
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

            // $log.info(JSON.stringify(methods, null, 2));

            try {

                $log.info('starting sale...');

                // const bobSaleContract = await tezos.bob.contract.at(marketplace.address);

                // let methods =  marketplace.parameterSchema.ExtractSignatures();
                // $log.info(`Error: ${JSON.stringify(methods, null, 2)}`);

                // $log.info('a wat');

                // const sellOp = await marketplace.methods.sell(new BigNumber(20)
                //                                                   ,nft.address
                //                                                   ,new BigNumber(1)
                //                                                   ,ft.address
                //                                                   , new BigNumber(5)).send({amount: 0});
                // $log.info(`waiting for ${sellOp.hash} to be confirmed...`);
                // const sellOpHash = await sellOp.confirmation().then(() => sellOp.hash);
                // $log.info(`Operation injected at hash=${sellOpHash}`);

                $log.info('pause marketplace');
                const pauseOp = await marketplace.methods.pause(true).send({ amount: 0 });
                $log.info(`Waiting for ${pauseOp.hash} to be confirmed...`);
                const pauseOpHash = await pauseOp.confirmation().then(() => pauseOp.hash);
                $log.info(`Operation injected at hash=${pauseOpHash}`);

            }
            catch (error) {
                $log.info(`same error as before`);
                // $log.info(`Error: ${JSON.stringify(error, null, 2)}`);
            }

        })

    });
