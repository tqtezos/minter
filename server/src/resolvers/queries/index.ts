import { Resolvers, QueryResolvers } from "../../generated/graphql_schema";
import { SessionContext } from "../../components/context";
import axios from "axios";

const getTzStats = async (ctx: SessionContext, resource: string) =>
  (await axios.get(`${ctx.tzStatsApiUrl}/${resource}`)).data;

const Query: QueryResolvers = {
  contractStorage(_parent, { contract_id }, ctx) {
    return getTzStats(ctx, `contract/${contract_id}/storage`);
  },

  contractOperations(_parent, { contract_id }, ctx) {
    return getTzStats(ctx, `contract/${contract_id}/calls?order=desc`);
  },

  settings(_parent, _args, { tzStatsUrl }) {
    return { tzStatsUrl };
  }
};

const resolvers: Resolvers = {
  Query
};

export default resolvers;
