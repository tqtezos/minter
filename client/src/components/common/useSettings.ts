import { gql, useQuery } from '@apollo/client';
import { Settings } from '../../generated/graphql_schema';

const SETTINGS = gql`
  query Settings {
    settings {
      rpc
      tzStatsUrl
      contracts {
        nft
      }
    }
  }
`;

export interface Data {
  settings: Settings
}
  
export default () => useQuery<Data, void>(SETTINGS);
  

