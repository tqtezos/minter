/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useState } from 'react';
import { message } from 'antd';

import HeaderButton from '../common/HeaderButton';
import { useTzToolkit, useTzToolkitSetter } from '../App/globalContext';
import config from '../../config.json';
import * as beaconWallet from './beaconWallet';

const WalletConnector: FC = () => {
  const tzToolkit = useTzToolkit();
  const setTzToolkit = useTzToolkitSetter();
  const [connecting, setConnecting] = useState(false);

  const handleConenct = async () => {
    const { rpc, bcdNetwork } = config;

    try {
      setConnecting(true);
      const tzToolkit = await beaconWallet.connect(rpc, bcdNetwork);
      setTzToolkit(tzToolkit);
    } catch (err) {
      message.error(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (tzToolkit) {
      const [, beaconWallet] = tzToolkit;
      beaconWallet.disconnect();
    }
    setTzToolkit(undefined);
  };

  return tzToolkit ? (
    <HeaderButton title="Disconnect" onClick={handleDisconnect} />
  ) : (
    <HeaderButton
      title="Connect"
      onClick={handleConenct}
      loading={connecting}
    />
  );
};

export default WalletConnector;
