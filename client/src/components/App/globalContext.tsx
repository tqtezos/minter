import React, {
  FC,
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from 'react';

import { TezosToolkit } from '@taquito/taquito';
import useSettings from '../common/useSettings';
import mkContracts, { Contracts } from '../../api/contracts';
import { useApolloClient } from '@apollo/client';
import { BeaconWallet } from '@taquito/beacon-wallet';

type Toolkit = [TezosToolkit, BeaconWallet] | undefined;

const TzToolkitContext = createContext<Toolkit>(undefined);
type TztSetter = Dispatch<SetStateAction<Toolkit>>;
const TzToolkitSetterContext = createContext<TztSetter>(() => null);

const ContractsContext = createContext<Contracts | undefined>(undefined);

const GlobalContextProvider: FC = ({ children }) => {
  const apolloClient = useApolloClient();
  const [tzToolkit, setTzToolkit] = React.useState<Toolkit>();
  const [contracts, setContracts] = React.useState<Contracts | undefined>();
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (tzToolkit && settings)
      setContracts(mkContracts(apolloClient, tzToolkit[0], settings.contracts));
    else setContracts(undefined);
  }, [apolloClient, tzToolkit, settings]);

  return (
    <>
      {loading && <div>Loading setting from the server...</div>}
      {settings && (
        <TzToolkitContext.Provider value={tzToolkit}>
          <TzToolkitSetterContext.Provider value={setTzToolkit}>
            <ContractsContext.Provider value={contracts}>
              {children}
            </ContractsContext.Provider>
          </TzToolkitSetterContext.Provider>
        </TzToolkitContext.Provider>
      )}
    </>
  );
};

const useTzToolkit = () => useContext(TzToolkitContext);
const useTzToolkitSetter = () => useContext(TzToolkitSetterContext);
const useContracts = () => useContext(ContractsContext);

const useWalletAddress = (): string | undefined => {
  const tzToolkit = useTzToolkit();
  const [address, setAddress] = useState<string>();

  useEffect(() => {
    if (tzToolkit) tzToolkit[0].wallet.pkh().then(setAddress);
    else setAddress(undefined);
  }, [tzToolkit]);

  return address;
};

export default GlobalContextProvider;
export { useTzToolkit, useTzToolkitSetter, useContracts, useWalletAddress };
