import { DB } from "../components/context";
import { Profile as IProfile } from "../generated/graphql_schema";

type ICreateArgs = Omit<IProfile, "id">;
type IUpdateArgs = Omit<IProfile, "id">;

export default class Profile {
  static create(db: DB, args: ICreateArgs) {
    return db("profiles").insert({
      alias: args.alias,
      address: args.address
    });
  }

  static byId(db: DB, id: number) {
    return db<IProfile>("profiles")
      .where({ id })
      .first();
  }

  static byAlias(db: DB, alias: string) {
    return db<IProfile>("profiles")
      .where({ alias })
      .first();
  }

  static byAddress(db: DB, address: string) {
    return db<IProfile>("profiles")
      .where({ address })
      .first();
  }

  static async count(db: DB): Promise<number | string | undefined> {
    const result = await db("profiles").count({ count: "*" });
    return parseInt(String(result[0].count)) || 0;
  }

  static all(db: DB): Promise<IProfile[]> {
    return db<IProfile>("profiles");
  }

  static updateProfile(db: DB, address: string, args: IUpdateArgs) {
    return db("profiles")
      .where({ address })
      .update(args);
  }
}
