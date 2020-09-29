import { TezosToolkit } from '@taquito/taquito';

import mkNftContract from './nftContract';
import mkNftFactoryContract from './nftFactoryContract';
import { SettingsContracts } from '../generated/graphql_schema';

const mkContracts = (tzToolkit: TezosToolkit, settings: SettingsContracts) => ({
  nft: () => mkNftContract(tzToolkit, settings.nftFaucet),
  nftFactory: () => mkNftFactoryContract(tzToolkit, settings.nftFactory)
});

export type Contracts = ReturnType<typeof mkContracts>;
export default mkContracts;
