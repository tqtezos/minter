import React, { createContext, useState } from 'react';
import { Minter, SystemWithToolkit, SystemWithWallet } from '../lib/system';
import config from '../config.json';

type System = SystemWithToolkit | SystemWithWallet;

interface ISystemContext {
  system: System;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const SystemContext = createContext<ISystemContext>(
  {} as ISystemContext
);

function SystemContextProvider(props: { children: React.ReactNode }) {
  const configured = Minter.configure(config);
  const withToolkit = Minter.connectToolkit(configured);
  const [system, setSystem] = useState<System>(withToolkit);

  const connect = async () => {
    if (system.status === 'ToolkitConnected') {
      setSystem(await Minter.connectWallet(system));
    }
  };

  const disconnect = async () => {
    if (system.status === 'WalletConnected') {
      setSystem(await Minter.disconnectWallet(system));
    }
  };

  return (
    <SystemContext.Provider value={{ system, connect, disconnect }}>
      {props.children}
    </SystemContext.Provider>
  );
}

export default SystemContextProvider;
