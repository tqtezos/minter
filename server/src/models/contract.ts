import { DB } from "../components/context";
import { DbContract } from "../resolvers/types";

interface CreateArgs {
  name: string;
  address: string;
  is_default?: boolean;
  creator_id: number;
}

function selectContract(db: DB) {
  return db<DbContract>("contracts").select(
    "id",
    "name",
    "address",
    "is_default",
    "creator_id"
  );
}

export default class Contract {
  static async create(db: DB, args: CreateArgs) {
    return await db("contracts").insert({
      name: args.name,
      address: args.address,
      is_default: Boolean(args.is_default),
      creator_id: args.creator_id
    });
  }

  static async byAddress(db: DB, address: string) {
    return await selectContract(db)
      .where({ address })
      .first();
  }

  static async byName(db: DB, name: string) {
    return await selectContract(db)
      .where({ name })
      .first();
  }

  static async all(db: DB) {
    return await selectContract(db);
  }

  static async count(db: DB): Promise<number | string | undefined> {
    const result = await db("contracts").count({ count: "*" });
    return parseInt(String(result[0].count)) || 0;
  }
}
