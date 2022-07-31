import { ObjectId } from "mongodb"
import type { SimpleMention } from "webmention-handler"

export type MongoDbPending = SimpleMention & {
  _id: ObjectId,
  processed: boolean
}