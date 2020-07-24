import knex from "knex";

export default async function connect() {
  console.log("[DB] Initializing client...");
  const { env } = process;
  const db = knex({
    client: "postgres",
    connection: {
      host: env.POSTGRES_HOST || "127.0.0.1",
      port: env.POSTGRES_PORT ? parseInt(env.POSTGRES_PORT) : 5432,
      user: env.POSTGRES_USER || "postgres",
      password: env.POSTGRES_PASSWORD || "secret",
      database: "postgres"
    },
    pool: {
      min: 0,
      max: 10
    },
    useNullAsDefault: true
  });
  console.log("[DB] Client initialized");
  return db;
}
