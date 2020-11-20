import { TezosToolkit } from '@taquito/taquito';
import { ApolloClient } from '@apollo/client'

import { SettingsContracts } from '../generated/graphql_schema';
import mkNftFactoryContract from './nftFactoryContract';
import mkNftContractApi from './nftContractApi';

const mkContracts = (client: ApolloClient<object>, tzToolkit: TezosToolkit, settings: SettingsContracts) => ({
  nft: () => mkNftContractApi(client, tzToolkit, settings),
  nftFactory: () => mkNftFactoryContract(client, tzToolkit, settings.nftFactory)
});

export type Contracts = ReturnType<typeof mkContracts>;
export default mkContracts;
