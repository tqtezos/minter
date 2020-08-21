import { $log } from '@tsed/logger';
import { BigNumber } from 'bignumber.js';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';

import { bootstrap, TestTz } from '../src/bootstrap-sandbox';
import { Contract, address, nat } from '../src/type-aliases';

import {
  originateMinter,
  originateNft,
  originateNftWithHooks,
  MinterStorage,
  MinterTokenMetadata
} from '../src/nft-contracts';
import { BalanceOfRequest, transfer, addOperator } from '../src/fa2-interface';
import {
  originateInspector,
  InspectorStorage,
  queryBalances
} from './fa2-balance-inspector';

jest.setTimeout(180000); // 3 minutes

const nat1 = new BigNumber(1);

describe.each([originateNft, originateNftWithHooks])('test NFT', createNft => {
  let tezos: TestTz;
  let minter: Contract;
  let nft: Contract;
  let inspector: Contract;

  beforeAll(async () => {
    tezos = await bootstrap();
    inspector = await originateInspector(tezos.bob);
  });

  beforeEach(async () => {
    const admin = await tezos.bob.signer.publicKeyHash();
    minter = await originateMinter(tezos.bob, admin);
    nft = await createNft(tezos.bob, minter.address);
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
    tokens: MinterTokenMetadata[]
  ): Promise<nat[]> {
    const op = await minter.methods.mint(nft.address, tokens).send();
    const hash = await op.confirmation(3);
    $log.info(`consumed gas: ${op.consumedGas}`);
    const storage = await minter.storage<MinterStorage>();
    return storage.last_created_token_ids;
  }

  // test.only('update_operators', async () => {
  //   const bobAddress = await tezos.bob.signer.publicKeyHash();
  //   await addOperator(nft.address, tezos.alice, bobAddress);
  // });

  // test('check origination', () => {
  //   $log.debug(`minter ${minter.address}`);
  //   $log.debug(`nft ${nft.address}`);
  // })

  test('mint token', async () => {
    const bobAddress = await tezos.bob.signer.publicKeyHash();
    $log.info('minting');
    const [tokenId] = await mintTokens(tezos.bob, [
      {
        symbol: 'TK1',
        name: 'A token',
        owner: bobAddress,
        extras: new MichelsonMap<string, string>()
      }
    ]);
    $log.info(`minted token ${tokenId}`);

    const [bobHasToken] = await hasTokens([
      { owner: bobAddress, token_id: tokenId }
    ]);
    expect(bobHasToken).toBe(true);
  });

  test('transfer token', async () => {
    const aliceAddress = await tezos.alice.signer.publicKeyHash();
    const bobAddress = await tezos.bob.signer.publicKeyHash();
    $log.info('minting');
    const [tokenId] = await mintTokens(tezos.bob, [
      {
        symbol: 'TK1',
        name: 'A token',
        owner: bobAddress,
        extras: new MichelsonMap<string, string>()
      }
    ]);
    $log.info(`minted token ${tokenId}`);

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
    $log.info('minting');
    const [tokenId] = await mintTokens(tezos.bob, [
      {
        symbol: 'TK1',
        name: 'A token',
        owner: bobAddress,
        extras: new MichelsonMap<string, string>()
      }
    ]);
    $log.info(`minted token ${tokenId}`);

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
    $log.info('minting');
    const [tokenId1, tokenId2] = await mintTokens(tezos.bob, [
      {
        symbol: 'TK1',
        name: 'A token',
        owner: bobAddress,
        extras: new MichelsonMap<string, string>()
      },
      {
        symbol: 'TK2',
        name: 'B token',
        owner: aliceAddress,
        extras: new MichelsonMap<string, string>()
      }
    ]);
    $log.info(`minted tokens ${tokenId1}, ${tokenId2}`);

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

    await addOperator(nft.address, tezos.alice, bobAddress);

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
});
