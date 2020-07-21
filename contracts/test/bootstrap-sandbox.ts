import { Tezos } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { $log } from '@tsed/logger'


export function bootstrap(): void {
  Tezos.setProvider({
    signer: new InMemorySigner('edsk3RFgDiCt7tWB2oe96w1eRw72iYiiqZPLu9nnEY23MYRp2d8Kkx'),
    rpc: 'http://localhost:20000',
  });
  $log.debug("Flextesa Tezos is setup")
}

