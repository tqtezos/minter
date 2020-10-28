import { TezosToolkit } from '@taquito/taquito';

import { SettingsContracts } from '../generated/graphql_schema';
import mkNftFactoryContract from './nftFactoryContract';
import mkNftContractApi from './nftContractApi';

const mkContracts = (tzToolkit: TezosToolkit, settings: SettingsContracts) => ({
  nft: () => mkNftContractApi(tzToolkit, settings),
  nftFactory: () => mkNftFactoryContract(tzToolkit, settings.nftFactory)
});

export type Contracts = ReturnType<typeof mkContracts>;
export default mkContracts;
