/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useState } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { ThanosWallet } from '@thanos-wallet/dapp';
import { message } from 'antd';

import HeaderButton from '../common/HeaderButton';

interface Props {
  tzClient?: TezosToolkit;
  onChange: (tzClient?: TezosToolkit) => void;
}

const WalletConnector: FC<Props> = ({ tzClient, onChange }) => {
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    try {
      const available = await ThanosWallet.isAvailable();
    
      if (!available)
        throw new Error('Thanos Wallet is not installed!');

      setConnecting(true);
      const wallet = new ThanosWallet('Open Minter');
      await wallet.connect('sandbox', { forcePermission: true })
    
      return wallet.toTezos();
    } catch (err) {
      message.error(err.message)
    } finally {
      setConnecting(false);
    }
  }

  const handleConenct = () => {
    connect().then(tzClient => onChange(tzClient));
  }

  const handleDisconnect = () => {
    window.localStorage.clear();
    onChange(undefined);
  }

  return (
    tzClient 
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
