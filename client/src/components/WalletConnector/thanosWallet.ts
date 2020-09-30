import { ThanosWallet } from '@thanos-wallet/dapp';
import * as tzUtils from '../../utils/tezosToolkit';

export const connect = async (rpc: string) => {
  const available = await ThanosWallet.isAvailable();

  if (!available)
    throw new Error('Thanos Wallet is not installed!');

  const wallet = new ThanosWallet('OpenMinter');
  
  await wallet.connect(
    { name: rpc, rpc }, 
    { forcePermission: true }
  );

  const tzToolkit = wallet.toTezos();
  tzUtils.setConfirmationPollingInterval(tzToolkit);

  return tzToolkit;
}