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

describe('test market (test_case_2)', () => {
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
            const admin = await tezos.bob.signer.publicKeyHash();
            nft = await originateNftFaucet(tezos.bob, admin);
            marketplace = await originateFixedPriceTezSale(tezos.bob);
            marketAddress = marketplace.address;
            aliceAddress = await tezos.alice.signer.publicKeyHash();
            bobAddress = await tezos.bob.signer.publicKeyHash();
            tokenId = new BigNumber(1);
            tokenMetadata  = new MichelsonMap();
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
            tokens: MintNftParam[],
        ): Promise<void> {
            $log.info('minting...');
            const op = await nft.methods.mint(tokens).send();
            const hash = await op.confirmation();
            $log.info(`Minted tokens. Consumed gas: ${op.consumedGas}`);
        }

        test('bob mints tokens', async () => {

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


        });

        test('make marketplace operator of bob\'s token', async () => {

            $log.info('making marketplace an operator of bob\'s token');
            await addOperator(nft.address, tezos.bob, marketAddress, tokenId);

        });

      test('bob makes sale, cancels it, then alice unsuccessfully tries to buy', async () => {
          $log.info('starting sale...');
          tezos.bob.contract
              .at(marketplace.address)
              .then((contract) => {
                  return contract.methods.sell(salePrice,nft.address,tokenId).send({source: bobAddress, amount: 0});
              })
              .then((op) => {
                  $log.info(`Waiting for ${op.hash} to be confirmed...`);
                  return op.confirmation(1).then(() =>  op.hash);
              })
              .then((hash) => {
                  $log.info(`Operation injected at hash=${hash}`);
                  $log.info('bob cancels sale');
                  tezos.bob.contract
                      .at(marketplace.address)
                      .then((contract) => {
                          return contract.methods.cancel(salePrice,nft.address,tokenId).send({source:bobAddress, amount: 0});
                      })
                      .then((op) => {
                          $log.info(`Waiting for ${op.hash} to be confirmed...`);
                          return op.confirmation(1).then(() =>  op.hash);
                      })
                      .then((hash) => {
                          $log.info(`Operation injected at hash=${hash}`);
                          $log.info('alice tries to buy');
                          tezos.alice.contract
                              .at(marketplace.address)
                              .then((contract) => {
                                  return contract.methods.buy(salePrice,nft.address,tokenId).send({source:aliceAddress, amount: 1});
                              })
                              .catch((error) => $log.info(`alice couldn't buy`));
                      });

              });
      });
});
