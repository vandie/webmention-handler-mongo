import type { IWebMentionStorage, Mention, SimpleMention } from 'webmention-handler';
import { Collection, Db, MongoClient, type Filter, type WithId } from 'mongodb';
import { MongoDbPending } from './types/mongo-db-pending.type';
import { MongoWebmentionOptions } from './types/mongo-webmention-options.type';

export class MongoWebMentionStorage implements IWebMentionStorage {
  mongoClient: MongoClient;
  dbName: string;
  pendingCollection: string;
  mentionCollection: string;
  maxPendingFetch: number;
  limitMentionsPerPageFetch: number;

  private db(): Db {
    return this.mongoClient.db(this.dbName);
  }

  private fetchCollection<T> (collection: string): Collection<T> {
    const connection = this.db();
    return connection.collection<T>(collection)
  }

  constructor(config: MongoWebmentionOptions) {
    this.mongoClient = new MongoClient(config.databaseUri);
    this.dbName = config.dbName;
    this.pendingCollection = config.pendingCollection;
    this.mentionCollection = config.mentionCollection;
    this.maxPendingFetch = config.maxPendingFetch || 50;
    this.limitMentionsPerPageFetch = config.limitMentionsPerPageFetch || 50;
  }


  async addPendingMention(mention: SimpleMention): Promise<MongoDbPending> {
    const collection = this.fetchCollection<MongoDbPending>(this.pendingCollection);
    const result = await collection.updateOne(mention, {$set: {...mention, processed: false} }, { upsert: true });
    return {
      _id: result.upsertedId,
      ...mention,
      processed: false
    };
  }

  async getNextPendingMentions(): Promise<MongoDbPending[]> {
    const collection = this.fetchCollection<MongoDbPending>(this.pendingCollection);
    const mentions = await collection.find({ processed: false }, { limit: this.maxPendingFetch}).toArray();
    const ids = mentions.map(({_id}) => _id);
    await collection.updateMany({_id: { $in: ids } }, {$set: {processed: true}});
    return mentions;
  }

  async deleteMention(mention: SimpleMention): Promise<null> {
    const collection = this.fetchCollection<Mention>(this.mentionCollection);
    await collection.deleteOne({ source: mention.source, target: mention.target });
    return null;
  }

  async storeMentionForPage(page: string, mention: Mention): Promise<WithId<Mention>> {
    const collection = this.fetchCollection<Mention>(this.mentionCollection);
    await collection.updateOne({target: mention.target, source: mention.source}, {$set: mention }, { upsert: true });
    const storedMention = await collection.findOne<WithId<Mention>>({target: mention.target, source: mention.source});
    if(!storedMention) throw new Error(`Could not find Mention after insertion, source ${mention.source} & target ${mention.target}`);
    return storedMention;
  }

  async getMentionsForPage(page: string, type?: string): Promise<WithId<Mention>[]> {
      const q: Filter<Mention> = {
        target: page
      };
      if(type) q.type = type;
      const collection = this.fetchCollection<Mention>(this.mentionCollection);
      return collection.find(q, {limit: this.limitMentionsPerPageFetch}).toArray();
  }
}