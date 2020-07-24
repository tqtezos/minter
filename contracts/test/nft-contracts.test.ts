import { bootstrap, TestTz } from './bootstrap-sandbox';
import { $log } from '@tsed/logger';
import { Contract, originate_minter, originate_nft } from './nft-contracts'
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';


jest.setTimeout(20000);

describe('initialize', () => {
  let tezos: TestTz;
  let minter: Contract;
  let nft: Contract;

  beforeAll(async () => {
    tezos = await bootstrap();
  })

  beforeEach(async () => {
    const admin = await tezos.bob.signer.publicKeyHash();
    minter = await originate_minter(tezos.bob, admin);
    nft = await originate_nft(tezos.bob, minter.address);
  })

  // test('check origination', () => {
  //   $log.debug(`minter ${minter.address}`);
  //   $log.debug(`nft ${nft.address}`);
  // })

  async function mint_token(tz: TezosToolkit, symbol: string, name: string, owner: string): Promise<void> {
    const op = await minter.methods.mint(nft.address, [{
      symbol,
      name,
      owner,
      extras: new MichelsonMap()
    }]).send();
    const hash = await op.confirmation(3);
    $log.info(`consumed gas ${op.consumedGas}`);
    return Promise.resolve();
  }

  test('mint token', async () => {
    const bobAddress = await tezos.bob.signer.publicKeyHash();
    $log.info('minting')
    await mint_token(tezos.bob, 'TK1', 'A token', bobAddress);
    $log.info('minted');
  })

})
