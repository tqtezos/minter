/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useState } from 'react';
import { ThanosWallet } from '@thanos-wallet/dapp';
import { message } from 'antd';

import HeaderButton from '../common/HeaderButton';
import { useTzToolkit, useTzToolkitSetter } from '../App/globalContext';

const WalletConnector: FC = () => {
  const tzToolkit = useTzToolkit();
  const setTzToolkit = useTzToolkitSetter();
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    try {
      const available = await ThanosWallet.isAvailable();
    
      if (!available)
        throw new Error('Thanos Wallet is not installed!');

      setConnecting(true);
      const wallet = new ThanosWallet('Open Minter');
      await wallet.connect('sandbox', { forcePermission: true })
    
      const tzToolkit = wallet.toTezos();
      tzToolkit.setProvider({config: {confirmationPollingIntervalSecond: 2}})
      return tzToolkit;
    } catch (err) {
      message.error(err.message)
    } finally {
      setConnecting(false);
    }
  }

  const handleConenct = () => {
    connect().then(setTzToolkit);
  }

  const handleDisconnect = () => {
    window.localStorage.clear();
    setTzToolkit(undefined);
  }

  return (
    tzToolkit 
      ? <HeaderButton 
          title="Disconnect" 
          onClick={handleDisconnect} 
        />
      : <HeaderButton 
          title="Connect" 
          onClick={handleConenct} 
          loading={connecting} 
        />
  );
}

export default WalletConnector;
