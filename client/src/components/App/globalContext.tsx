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

const TzToolkitContext = createContext<TezosToolkit | undefined>(undefined);

type TztSetter = Dispatch<SetStateAction<TezosToolkit | undefined>>;
const TzToolkitSetterContext = createContext<TztSetter>(undefined!);

const ContractsContext = createContext<Contracts | undefined>(undefined);

const GlobalContextProvider: FC = ({ children }) => {
  const [tzToolkit, setTzToolkit] = React.useState<TezosToolkit | undefined>();
  const [contracts, setContracts] = React.useState<Contracts | undefined>();
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (tzToolkit && settings)
      setContracts(mkContracts(tzToolkit, settings.contracts));
    else setContracts(undefined);
  }, [tzToolkit, settings]);

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
    if (tzToolkit) tzToolkit.wallet.pkh().then(setAddress);
    else setAddress(undefined);
  }, [tzToolkit]);

  return address;
};

export default GlobalContextProvider;
export { useTzToolkit, useTzToolkitSetter, useContracts, useWalletAddress };
