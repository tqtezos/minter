import { DB } from '../components/context';
import { PublishedOperation as IPublishedOperation } from '../generated/graphql_schema';

type CreateArgs = Omit<IPublishedOperation, 'id'>;

export default class PublishedOperation {
  static create(db: DB, args: CreateArgs) {
    return db('published_operations').insert({
      hash: args.hash,
      initiator: args.initiator,
      method: args.method,
      params: args.params,
      status: args.status,
      retry: args.retry
    });
  }

  static byHash(db: DB, hash: string) {
    return db<IPublishedOperation>('published_operations')
      .where({ hash })
      .first();
  }

  static byInitiator(db: DB, initiator: string) {
    return db<IPublishedOperation>('published_operations')
      .where({ initiator })
      .first();
  }

  static byMethod(db: DB, method: string) {
    return db<IPublishedOperation>('published_operations')
      .where({ method })
      .first();
  }

  static byStatus(db: DB, status: string) {
    return db<IPublishedOperation>('published_operations')
      .where({ status })
      .first();
  }

  static all(db: DB) {
    return db<IPublishedOperation>('published_operations');
  }

  static async count(db: DB): Promise<number | string | undefined> {
    const result = await db('published_operations').count({ count: '*' });
    return parseInt(String(result[0].count)) || 0;
  }

  static updateStatusByHash(db: DB, hash: string, status: string) {
    return db<IPublishedOperation>('published_operations')
      .where({ hash })
      .update({ status });
  }
}
