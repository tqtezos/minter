import { bootstrap, TestTz } from './bootstrap-sandbox';
import { $log } from '@tsed/logger';
import { Contract, originateMinter, originateNft, originateInspector } from './nft-contracts'
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';


jest.setTimeout(20000);

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

  // test('check origination', () => {
  //   $log.debug(`minter ${minter.address}`);
  //   $log.debug(`nft ${nft.address}`);
  // })

  async function mintToken(tz: TezosToolkit, symbol: string, name: string, owner: string): Promise<void> {
    const op = await minter.methods.mint(nft.address, [{
      symbol,
      name,
      owner,
      extras: new MichelsonMap()
    }]).send();
    const hash = await op.confirmation(3);
    $log.info(`consumed gas: ${op.consumedGas}`);
    return Promise.resolve();
  }

  test('mint token', async () => {
    const bobAddress = await tezos.bob.signer.publicKeyHash();
    $log.info('minting')
    await mintToken(tezos.bob, 'TK1', 'A token', bobAddress);
    $log.info('minted');
  })

})
