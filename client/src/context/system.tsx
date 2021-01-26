import React, { createContext, useState } from 'react';
import { Minter, SystemWithToolkit, SystemWithWallet } from '../lib/system';

// TODO: Import from ./config.json
const config = {
  rpc: 'http://localhost:8732',
  network: 'sandboxnet',
  bcd: {
    api: 'http://localhost:42000',
    gui: 'http://localhost:8009'
  },
  contracts: {
    nft: 'KT1NsRvJCvXymYedx3yxj5mcs6J1xsT5gpMM'
  }
};

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
