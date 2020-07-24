import { DB } from "../components/context";
import { DbUser } from "../resolvers/types";
import bcrypt from "bcrypt";
import Cryptr from "cryptr";

export function encryptWithPassword(password: string, value: string) {
  const cryptr = new Cryptr(password);
  return cryptr.encrypt(value);
}

export function decryptWithPassword(password: string, value: string) {
  const cryptr = new Cryptr(password);
  return cryptr.decrypt(value);
}

interface CreateArgs {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  tz_public_key?: string;
  tz_secret_key?: string;
}

type UpdateArgs = Partial<{
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}>;

function selectUsers(db: DB) {
  return db<DbUser>("users").select(
    "id",
    "first_name",
    "last_name",
    "username",
    "email",
    "tz_public_key",
    "has_wallet"
  );
}

interface AuthUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  tz_secret_key?: string;
  has_wallet: boolean;
}

export default class User {
  static async create(db: DB, args: CreateArgs) {
    return await db("users").insert({
      first_name: args.first_name,
      last_name: args.last_name,
      username: args.username,
      email: args.email,
      password_hash: await bcrypt.hash(args.password, 10),
      tz_public_key: args.tz_public_key || null,
      tz_secret_key: args.tz_secret_key || null,
      //FIXME Provide a better solution, perhaps let users specify
      //passphrase or explicitely choose not to encrypt the private key
      //independently from login
      // tz_secret_key: args.tz_secret_key
      //   ? encryptWithPassword(args.password, args.tz_secret_key)
      //   : null,
      has_wallet: Boolean(args.tz_public_key && args.tz_secret_key)
    });
  }

  static async byId(db: DB, id: number) {
    return await db<DbUser>("users")
      .where({ id })
      .first();
  }

  static async byEmail(db: DB, email: string) {
    return await db<DbUser>("users")
      .where({ email })
      .first();
  }

  static async byUsername(db: DB, username: string) {
    return await db<DbUser>("users")
      .where({ username })
      .first();
  }

  static async byPublicKey(db: DB, tz_public_key: string) {
    return await db<DbUser>("users")
      .where({ tz_public_key })
      .first();
  }

  static async match(db: DB, match: string) {
    return await db<DbUser>("users")
      .where({ email: match })
      .orWhere({ username: match })
      .orWhere({ tz_public_key: match })
      .first();
  }

  static async authenticate(db: DB, username: string, password: string) {
    const user = await db<AuthUser>("users")
      .select(
        "id",
        "email",
        "username",
        "password_hash",
        "tz_secret_key",
        "has_wallet"
      )
      .where({ username })
      .orWhere({ email: username })
      .first();

    if (!user) {
      return null;
    }

    //let secretKey;
    // if (user.tz_secret_key) {
    //   //secretKey = new Cryptr(password).decrypt(user.tz_secret_key);
    //   secretKey = user.tz_secret_key;
    // }

    // return { id: user.id, secretKey };
    return { id: user.id };
  }

  static async count(db: DB): Promise<number | string | undefined> {
    const result = await db("users").count({ count: "*" });
    return parseInt(String(result[0].count)) || 0;
  }

  static async all(db: DB): Promise<DbUser[]> {
    return await selectUsers(db);
  }

  static async updateWallet(
    db: DB,
    id: number,
    tz_public_key: string,
    tz_secret_key: string
  ) {
    return await db("users")
      .where({ id })
      .update({
        tz_public_key,
        tz_secret_key,
        has_wallet: true
      });
  }

  static async updateProfile(db: DB, id: number, args: UpdateArgs) {
    return await db("users")
      .where({ id })
      .update(args);
  }
}
