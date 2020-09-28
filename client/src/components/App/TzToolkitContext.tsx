import React, { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { TezosToolkit } from '@taquito/taquito';

const TzToolkitContext = createContext<TezosToolkit | undefined>(undefined);

type TztSetter = Dispatch<SetStateAction<TezosToolkit | undefined>>
const TzToolkitSetterContext = createContext<TztSetter>(undefined!);

const TzToolkitProvider = ({ children} : { children: any }) => {
  const [tzToolkit, setTzToolkit] = React.useState<TezosToolkit | undefined>();
  
  return (
    <TzToolkitContext.Provider value={tzToolkit}>
      <TzToolkitSetterContext.Provider value={setTzToolkit}>
        {children}
      </TzToolkitSetterContext.Provider>
    </TzToolkitContext.Provider>
  );
}

const useTzToolkit = () => useContext(TzToolkitContext);
const useTzToolkitSetter = () => useContext(TzToolkitSetterContext);

export default TzToolkitProvider;
export { useTzToolkit, useTzToolkitSetter }
