import React, {
  FC,
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  useReducer
} from 'react';

import { TezosToolkit } from '@taquito/taquito';
import useSettings from '../common/useSettings';
import mkContracts, { Contracts } from '../../api/contracts';
import { useApolloClient } from '@apollo/client';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { mkBetterCallDev, BetterCallDev } from '../../resolvers/betterCallDev';

type GlobalActions =
  | {
      type: 'init_tz_toolkit';
    }
  | {
      type: 'create_nft_contract';
    }
  | {
      type: 'create_non_fungible_token';
    }
  | {
      type: 'transfer_non_fungible_token';
    };

interface GlobalState {
  tzToolKit?: TezosToolkit;
  beaconWallet?: BeaconWallet;
  betterCallDev?: BetterCallDev;
  contracts?: Contracts;
}

interface IGlobalContext {
  state: GlobalState;
  dispatch: Dispatch<GlobalActions>;
}

const initialDependencies: GlobalState = {
  tzToolKit: undefined,
  beaconWallet: undefined,
  betterCallDev: undefined,
  contracts: undefined
};

function globalReducer(state: GlobalState, action: GlobalActions) {
  console.log(action);
  return state;
}

const GlobalContext = createContext<IGlobalContext>({
  state: initialDependencies,
  dispatch: (_action: GlobalActions) => null
});

type Toolkit = [TezosToolkit, BeaconWallet] | undefined;

const TzToolkitContext = createContext<Toolkit>(undefined);
type TztSetter = Dispatch<SetStateAction<Toolkit>>;
const TzToolkitSetterContext = createContext<TztSetter>(() => null);

const ContractsContext = createContext<Contracts | undefined>(undefined);

const GlobalContextProvider: FC = ({ children }) => {
  const apolloClient = useApolloClient();
  const [state, dispatch] = useReducer(globalReducer, initialDependencies);
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
        <GlobalContext.Provider value={{ state, dispatch }}>
          <TzToolkitContext.Provider value={tzToolkit}>
            <TzToolkitSetterContext.Provider value={setTzToolkit}>
              <ContractsContext.Provider value={contracts}>
                {children}
              </ContractsContext.Provider>
            </TzToolkitSetterContext.Provider>
          </TzToolkitContext.Provider>
        </GlobalContext.Provider>
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
