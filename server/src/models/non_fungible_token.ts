import { DB } from "../components/context";
import { NonFungibleToken as INonFungibleToken } from "../generated/graphql_schema";

type CreateArgs = Omit<INonFungibleToken, "id">;

export default class NonFungibleToken {
  static create(db: DB, args: CreateArgs) {
    return db("non_fungible_tokens").insert({
      token_id: args.token_id,
      creator_address: args.creator_address,
      operation_address: args.operation_address
    });
  }

  static byTokenId(db: DB, token_id: string) {
    return db<INonFungibleToken>("non_fungible_tokens")
      .where({ token_id })
      .first();
  }

  static byCreatorAddress(db: DB, creator_address: string) {
    return db<INonFungibleToken>("non_fungible_tokens")
      .where({ creator_address })
      .first();
  }

  static byOperationAddress(db: DB, operation_address: string) {
    return db<INonFungibleToken>("non_fungible_tokens")
      .where({ operation_address })
      .first();
  }

  static all(db: DB) {
    return db<INonFungibleToken>("non_fungible_tokens");
  }

  static async count(db: DB): Promise<number | string | undefined> {
    const result = await db("non_fungible_tokens").count({ count: "*" });
    return parseInt(String(result[0].count)) || 0;
  }
}
