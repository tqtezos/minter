/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useState } from 'react';
import { message } from 'antd';

import HeaderButton from '../common/HeaderButton';
import { useTzToolkit, useTzToolkitSetter } from '../App/globalContext';
import useSettings from '../common/useSettings';
import * as thanosWallet from './thanosWallet';
import * as beaconWallet from './beaconWallet';

const WalletConnector: FC = () => {
  const { settings } = useSettings();
  const tzToolkit = useTzToolkit();
  const setTzToolkit = useTzToolkitSetter();
  const [connecting, setConnecting] = useState(false);

  const handleConenct = async () => {
    if (!settings) throw Error('Problem getting settings from the server!');

    const { rpc, bcdNetwork } = settings;

    try {
      setConnecting(true);
      const tzToolkit = await beaconWallet.connect(rpc, bcdNetwork);
      setTzToolkit(tzToolkit);
    } catch (err) {
      if (err.name === 'NotGrantedThanosWalletError')
        message.error('Transaction rejected');
      else message.error(err.message);
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
