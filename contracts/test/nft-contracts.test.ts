import { $log } from '@tsed/logger';
import { BigNumber } from 'bignumber.js';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';

import { bootstrap, TestTz } from './bootstrap-sandbox';
import { Contract, nat } from '../src/type-aliases';

import {
  originateNftFaucet,
  originateNft,
  MintNftParam
} from '../src/nft-contracts';
import {
  BalanceOfRequest,
  transfer,
  addOperator,
  removeOperator
} from '../src/fa2-interface';
import { originateInspector, queryBalances } from './fa2-balance-inspector';

jest.setTimeout(180000); // 3 minutes

const nat1 = new BigNumber(1);

describe.each([originateNftFaucet /*, originateNft*/])(
  'test NFT',
  createNft => {
    let tezos: TestTz;
    let nft: Contract;
    let inspector: Contract;

    beforeAll(async () => {
      tezos = await bootstrap();
      inspector = await originateInspector(tezos.bob);
    });

    beforeEach(async () => {
      const admin = await tezos.bob.signer.publicKeyHash();
      nft = await createNft(tezos.bob, admin);
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
      tokens: MintNftParam[]
    ): Promise<void> {
      $log.info('minting...');
      const op = await nft.methods.mint(tokens).send();
      const hash = await op.confirmation();
      $log.info(`Minted tokens. Consumed gas: ${op.consumedGas}`);
    }

    // test.only('update_operators', async () => {
    //   const bobAddress = await tezos.bob.signer.publicKeyHash();
    //   await addOperator(nft.address, tezos.alice, bobAddress);
    // });

    // test.only('check origination', () => {
    //   $log.debug(`nft ${nft.address}`);
    // });

    test('mint token', async () => {
      const bobAddress = await tezos.bob.signer.publicKeyHash();

      await mintTokens(tezos.bob, [
        {
          metadata: {
            token_id: new BigNumber(0),
            symbol: 'TK1',
            name: 'A token',
            decimals: new BigNumber(0),
            extras: new MichelsonMap<string, string>()
          },
          owner: bobAddress
        }
      ]);

      const [bobHasToken] = await hasTokens([
        { owner: bobAddress, token_id: new BigNumber(0) }
      ]);
      expect(bobHasToken).toBe(true);
    });

    test('transfer token', async () => {
      const aliceAddress = await tezos.alice.signer.publicKeyHash();
      const bobAddress = await tezos.bob.signer.publicKeyHash();
      const tokenId = new BigNumber(0);
      await mintTokens(tezos.bob, [
        {
          metadata: {
            token_id: tokenId,
            symbol: 'TK1',
            name: 'A token',
            decimals: new BigNumber(0),
            extras: new MichelsonMap<string, string>()
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

      await transfer(nft.address, tezos.bob, [
        {
          from_: bobAddress,
          txs: [{ to_: aliceAddress, token_id: tokenId, amount: nat1 }]
        }
      ]);

      const [aliceHasATokenAfter, bobHasATokenAfter] = await hasTokens([
        { owner: aliceAddress, token_id: tokenId },
        { owner: bobAddress, token_id: tokenId }
      ]);
      expect(aliceHasATokenAfter).toBe(true);
      expect(bobHasATokenAfter).toBe(false);
    });

    test('transfer not by owner must fail', async () => {
      const aliceAddress = await tezos.alice.signer.publicKeyHash();
      const bobAddress = await tezos.bob.signer.publicKeyHash();
      const tokenId = new BigNumber(0);
      await mintTokens(tezos.bob, [
        {
          owner: bobAddress,
          metadata: {
            token_id: tokenId,
            symbol: 'TK1',
            name: 'A token',
            decimals: new BigNumber(0),
            extras: new MichelsonMap<string, string>()
          }
        }
      ]);

      // alice is trying to transfer tokens on behalf of bob
      const p = transfer(nft.address, tezos.alice, [
        {
          from_: bobAddress,
          txs: [{ to_: aliceAddress, token_id: tokenId, amount: nat1 }]
        }
      ]);

      await expect(p).rejects.toHaveProperty('message', 'FA2_NOT_OPERATOR');
    });

    test('transfer by operator', async () => {
      const aliceAddress = await tezos.alice.signer.publicKeyHash();
      const bobAddress = await tezos.bob.signer.publicKeyHash();
      const tokenId1 = new BigNumber(0);
      const tokenId2 = new BigNumber(1);
      await mintTokens(tezos.bob, [
        {
          owner: bobAddress,
          metadata: {
            token_id: tokenId1,
            symbol: 'TK1',
            name: 'A token',
            decimals: new BigNumber(0),
            extras: new MichelsonMap<string, string>()
          }
        },
        {
          owner: aliceAddress,
          metadata: {
            token_id: tokenId2,
            symbol: 'TK2',
            name: 'B token',
            decimals: new BigNumber(0),
            extras: new MichelsonMap<string, string>()
          }
        }
      ]);

      // check initial balances
      const [
        aliceHasToken1Before,
        aliceHasToken2Before,
        bobHasToken1Before,
        bobHasToken2Before
      ] = await hasTokens([
        { owner: aliceAddress, token_id: tokenId1 },
        { owner: aliceAddress, token_id: tokenId2 },
        { owner: bobAddress, token_id: tokenId1 },
        { owner: bobAddress, token_id: tokenId2 }
      ]);
      expect(aliceHasToken1Before).toBe(false);
      expect(aliceHasToken2Before).toBe(true);
      expect(bobHasToken1Before).toBe(true);
      expect(bobHasToken2Before).toBe(false);

      await addOperator(nft.address, tezos.alice, bobAddress, tokenId2);

      // swap tokens
      await transfer(nft.address, tezos.bob, [
        {
          from_: bobAddress,
          txs: [{ to_: aliceAddress, token_id: tokenId1, amount: nat1 }]
        },
        {
          from_: aliceAddress,
          txs: [{ to_: bobAddress, token_id: tokenId2, amount: nat1 }]
        }
      ]);

      await removeOperator(nft.address, tezos.alice, bobAddress, tokenId2);

      // check balances after the swap
      const [
        aliceHasToken1After,
        aliceHasToken2After,
        bobHasToken1After,
        bobHasToken2After
      ] = await hasTokens([
        { owner: aliceAddress, token_id: tokenId1 },
        { owner: aliceAddress, token_id: tokenId2 },
        { owner: bobAddress, token_id: tokenId1 },
        { owner: bobAddress, token_id: tokenId2 }
      ]);
      expect(aliceHasToken1After).toBe(true);
      expect(aliceHasToken2After).toBe(false);
      expect(bobHasToken1After).toBe(false);
      expect(bobHasToken2After).toBe(true);
    });
  }
);
