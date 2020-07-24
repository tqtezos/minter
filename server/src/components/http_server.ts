import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "graphql-tools";
import { ApolloServer } from "apollo-server-express";
import express, { Express } from "express";
import bodyParser from "body-parser";
import path from "path";
import http from "http";

import { Context } from "./context";
import resolvers from "../resolvers";

function applyRoutes(app: Express) {
  app.get("/*", async (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.join(process.cwd(), "build", "index.html"));
  });
}

function createApolloServer(context: Context, typeDefs: string) {
  return new ApolloServer({
    typeDefs,
    resolvers,
    formatError: error => {
      console.log(error);
      return error;
    },
    uploads: false,
    context
  });
}

function createSubScriptionServer(context: Context, typeDefs: string) {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const onConnect = async () => context;
  const options = { execute, subscribe, schema, onConnect };
  return SubscriptionServer.create(options, { noServer: true });
}

function createHttpServer(app: Express, context: Context, typeDefs: string) {
  app.locals = context;
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  applyRoutes(app);

  const subServer = createSubScriptionServer(context, typeDefs);
  const httpServer = http.createServer(app);

  httpServer.on("upgrade", (req, sock, head) => {
    if (req.url === "/graphql") {
      subServer.server.handleUpgrade(req, sock, head, ws => {
        subServer.server.emit("connection", ws, req);
      });
    }
  });
  return httpServer;
}

function runHttpServer(
  context: Context,
  typeDefs: string,
  port: number,
  isDev: boolean
) {
  const app = express();
  createApolloServer(context, typeDefs).applyMiddleware({ app: app as any });
  createHttpServer(app, context, typeDefs).listen(port, () => {
    console.log(`[Server] Serving on port ${port}`);
    if (isDev) {
      const gqlUrl = `http://localhost:${port}/graphql`;
      console.log(`[Server] Visit ${gqlUrl} to open the GraphQL playground`);
    }
  });
}

export default runHttpServer;
