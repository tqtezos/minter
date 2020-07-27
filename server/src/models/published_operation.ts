import { DB } from "../components/context";
import { PublishedOperation as IPublishedOperation } from "../generated/graphql_schema";

type CreateArgs = Omit<IPublishedOperation, "id">;

export default class PublishedOperation {
  static create(db: DB, args: CreateArgs) {
    return db("published_operations").insert({
      address: args.address,
      initiator_address: args.initiator_address
    });
  }

  static byAddress(db: DB, address: string) {
    return db<IPublishedOperation>("published_operations")
      .where({ address })
      .first();
  }

  static byInitiatorAddress(db: DB, initiator_address: string) {
    return db<IPublishedOperation>("published_operations")
      .where({ initiator_address })
      .first();
  }

  static all(db: DB) {
    return db<IPublishedOperation>("published_operations");
  }

  static async count(db: DB): Promise<number | string | undefined> {
    const result = await db("published_operations").count({ count: "*" });
    return parseInt(String(result[0].count)) || 0;
  }
}
