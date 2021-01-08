import { TezosToolkit } from '@taquito/taquito';
import { SettingsContracts } from '../generated/graphql_schema';
import mkNftContractApi from './nftContractApi';

const mkContracts = (tzToolkit: TezosToolkit, settings: SettingsContracts) => ({
  nft: () => mkNftContractApi(tzToolkit, settings)
});

export type Contracts = ReturnType<typeof mkContracts>;
export default mkContracts;
