import { bootstrap, TestTz } from './bootstrap-sandbox';
import { BigNumber } from 'bignumber.js'
import { $log } from '@tsed/logger';
import {
  Contract, originateMinter, originateNft, originateInspector,
  address, MinterStorage, MinterTokenMetadata,
  InspectorStorage, InspectorStorageState, BalanceOfRequest
} from './nft-contracts'
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { LigoEnv } from './ligo';


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

  async function hasTokens(requests: BalanceOfRequest[]): Promise<boolean[]> {
    $log.info('checking token balance');

    const op = await inspector.methods.query(
      nft.address, requests
    ).send();
    const hash = await op.confirmation(3);
    $log.info(`consumed gas: ${op.consumedGas}`);

    const storage = await inspector.storage<InspectorStorage>();
    if (Array.isArray(storage)) {
      const results = storage.map(se => {
        if (se.balance.eq(1))
          return true;
        else if (se.balance.eq(0))
          return false;
        else
          throw new Error(`Invalid NFT balance ${se.balance}`);
      });
      return Promise.resolve(results);
    }
    else
      return Promise.reject('Invalid inspector storage state Empty.');
  }

  // test('check origination', () => {
  //   $log.debug(`minter ${minter.address}`);
  //   $log.debug(`nft ${nft.address}`);
  // })

  async function mintTokens(tz: TezosToolkit, tokens: MinterTokenMetadata[]): Promise<number[]> {
    const op = await minter.methods.mint(nft.address, tokens).send();
    const hash = await op.confirmation(3);
    $log.info(`consumed gas: ${op.consumedGas}`);
    const storage = await minter.storage<MinterStorage>();
    return Promise.resolve(storage.last_created_token_ids);
  }

  test('mint token', async () => {
    const bobAddress = await tezos.bob.signer.publicKeyHash();
    $log.info('minting')
    const [tokenId] = await mintTokens(tezos.bob,
      [{
        symbol: 'TK1',
        name: 'A token',
        owner: bobAddress,
        extras: new MichelsonMap<string, string>()
      }]);
    $log.info(`minted token ${tokenId}`);

    const [bobHasToken] = await hasTokens([{ owner: bobAddress, token_id: tokenId }]);
    expect(bobHasToken).toBe(true);
  })

  async function transferNft(operator: TezosToolkit, from_: address, to_: address,
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
    const [tokenId] = await mintTokens(tezos.bob,
      [{
        symbol: 'TK1',
        name: 'A token',
        owner: bobAddress,
        extras: new MichelsonMap<string, string>()
      }]);
    $log.info(`minted token ${tokenId}`);

    const [aliceHasATokenBefore, bobHasATokenBefore] = await hasTokens([
      { owner: aliceAddress, token_id: tokenId },
      { owner: bobAddress, token_id: tokenId },
    ]);
    expect(aliceHasATokenBefore).toBe(false);
    expect(bobHasATokenBefore).toBe(true);

    await transferNft(tezos.bob, bobAddress, aliceAddress, tokenId);

    const [aliceHasATokenAfter, bobHasATokenAfter] = await hasTokens([
      { owner: aliceAddress, token_id: tokenId },
      { owner: bobAddress, token_id: tokenId },
    ]);
    expect(aliceHasATokenAfter).toBe(true);
    expect(bobHasATokenAfter).toBe(false);
  })

})
