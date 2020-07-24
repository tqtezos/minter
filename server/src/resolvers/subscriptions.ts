import { Resolvers } from "../generated/graphql_schema";

const resolvers: Resolvers = {
  Subscription: {
    operationSent: {
      subscribe: (_parent, _args, context) =>
        context.pubsub.asyncIterator(["OPERATION_SENT"])
    },
    operationConfirmed: {
      subscribe: (_parent, _args, context) =>
        context.pubsub.asyncIterator(["OPERATION_CONFIRMED"])
    }
  }
};

export default resolvers;
