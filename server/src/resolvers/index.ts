import { Resolvers } from "../generated/graphql_schema";
import queries from "./queries";
import mutations from "./mutations";
import subscriptions from "./subscriptions";
import GraphQLJSON from "graphql-type-json";

const resolvers: Resolvers = {
  ...queries,
  ...mutations,
  ...subscriptions,
  JSON: GraphQLJSON
};

export default resolvers;
