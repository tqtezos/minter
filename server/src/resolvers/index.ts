import { Resolvers } from '../generated/graphql_schema';
import queries from './queries';
import GraphQLJSON from 'graphql-type-json';

const resolvers: Resolvers = {
  ...queries,
  JSON: GraphQLJSON
};

export default resolvers;
