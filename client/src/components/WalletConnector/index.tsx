/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useState } from 'react';
import { message } from 'antd';

import HeaderButton from '../common/HeaderButton';
import { useTzToolkit, useTzToolkitSetter } from '../App/globalContext';
import useSettings from '../common/useSettings';
import * as thanosWallet from './thanosWallet';

const WalletConnector: FC = () => {
  const { settings } = useSettings();
  const tzToolkit = useTzToolkit();
  const setTzToolkit = useTzToolkitSetter();
  const [connecting, setConnecting] = useState(false);

  const handleConenct = async () => {
    if (!settings)
      throw Error('Problem gettings settings from the server!')

    try {
      setConnecting(true);
      const tzToolkit = await thanosWallet.connect(settings.rpc);
      setTzToolkit(tzToolkit);
    } catch (err) {
      message.error(err.message)
    } finally {
      setConnecting(false);
    }
  }

  const handleDisconnect = () => {
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
