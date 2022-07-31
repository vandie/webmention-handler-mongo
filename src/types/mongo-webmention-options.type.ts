export type MongoWebmentionOptions = {
  databaseUri: string,
  dbName: string,
  mentionCollection: string,
  pendingCollection: string,
  maxPendingFetch: number,
  limitMentionsPerPageFetch: number
}