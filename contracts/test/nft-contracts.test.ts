import { bootstrap, TestTz } from './bootstrap-sandbox';
import { BigNumber } from 'bignumber.js'
import { $log } from '@tsed/logger';
import {
  Contract, originateMinter, originateNft, originateInspector,
  MinterStorage, InspectorStorage
} from './nft-contracts'
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';


jest.setTimeout(180000); // 3 minutes per test

describe('initialize', () => {
  let tezos: TestTz;
  let minter: Contract;
  let nft: Contract;
  let inspector: Contract;

  beforeAll(async () => {
    tezos = await bootstrap();
    inspector = await originateInspector(tezos.bob);
  })

  beforeEach(async () => {
    const admin = await tezos.bob.signer.publicKeyHash();
    minter = await originateMinter(tezos.bob, admin);
    nft = await originateNft(tezos.bob, minter.address);
  })

  async function hasToken(owner: string, tokenId: number): Promise<boolean> {
    $log.info('checking token balance');

    const op = await inspector.methods.query(
      nft.address, owner, tokenId
    ).send();
    const hash = await op.confirmation(3);
    $log.info(`consumed gas: ${op.consumedGas}`);

    const storage = await inspector.storage<InspectorStorage>();
    if (storage.balance.eq(1))
      return Promise.resolve(true);
    else if (storage.balance.eq(0))
      return Promise.resolve(false);
    else
      return Promise.reject(`Invalid NFT balance ${storage.balance}`);
  }

  // test('check origination', () => {
  //   $log.debug(`minter ${minter.address}`);
  //   $log.debug(`nft ${nft.address}`);
  // })

  async function mintToken(tz: TezosToolkit, symbol: string, name: string, owner: string): Promise<number> {
    const op = await minter.methods.mint(nft.address, [{
      symbol,
      name,
      owner,
      extras: new MichelsonMap()
    }]).send();
    const hash = await op.confirmation(3);
    $log.info(`consumed gas: ${op.consumedGas}`);
    const storage = await minter.storage<MinterStorage>();
    return Promise.resolve(storage.last_created_token_ids[0]);
  }

  test('mint token', async () => {
    const bobAddress = await tezos.bob.signer.publicKeyHash();
    $log.info('minting')
    const tokenId = await mintToken(tezos.bob, 'TK1', 'A token', bobAddress);
    $log.info(`minted token ${tokenId}`);

    const bobHasToken = await hasToken(bobAddress, tokenId);
    expect(bobHasToken).toBe(true);
  })

  async function transferNft(operator: TezosToolkit, from_: string, to_: string,
    tokenId: number): Promise<void> {
    $log.info('transferring');
    const nftWithOperator = await operator.contract.at(nft.address);

    const op = await nftWithOperator.methods.transfer([{
      from_,
      txs: [{ to_, token_id: tokenId, amount: 1 }]
    }]).send();

    const hash = await op.confirmation(3);
    $log.info(`consumed gas: ${op.consumedGas}`);
    return Promise.resolve();
  }

  test('transfer token', async () => {
    const aliceAddress = await tezos.alice.signer.publicKeyHash();
    const bobAddress = await tezos.bob.signer.publicKeyHash();
    $log.info('minting')
    const tokenId = await mintToken(tezos.bob, 'TK1', 'A token', bobAddress);
    $log.info(`minted token ${tokenId}`);

    const aliceHasATokenBefore = await hasToken(aliceAddress, tokenId);
    const bobHasATokenBefore = await hasToken(bobAddress, tokenId);
    expect(aliceHasATokenBefore).toBe(false);
    expect(bobHasATokenBefore).toBe(true);

    await transferNft(tezos.bob, bobAddress, aliceAddress, tokenId);

    const aliceHasATokenAfter = await hasToken(aliceAddress, tokenId);
    const bobHasATokenAfter = await hasToken(bobAddress, tokenId);
    expect(aliceHasATokenAfter).toBe(true);
    expect(bobHasATokenAfter).toBe(false);
  })

})
