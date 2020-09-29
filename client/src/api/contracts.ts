import { TezosToolkit } from '@taquito/taquito';

import mkNftContract from './nftContract';
import { SettingsContracts } from '../generated/graphql_schema';

const mkContracts = (tzToolkit: TezosToolkit, settings: SettingsContracts) => ({
  nft: () => mkNftContract(tzToolkit, settings.nftFaucet)
});

export type Contracts = ReturnType<typeof mkContracts>;
export default mkContracts;
