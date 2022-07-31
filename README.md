# MongoDB Webmention Storage
A Mongo DB Storage Handler for the [Webmention-Handler](https://github.com/vandie/webmention-handler) as used on [mikevdv.dev](https://mikevdv.dev)
## Installation
Install with npm
```bash
npm install webmention-handler-mongodb --save
```
## Usage
Create a new instance of MongoWebMentionHandler
```typescript
import { MongoWebMentionHandler } from 'webmention-handler-mongodb';

const storage = new MongoWebMentionHandler({
  databaseUri: 'your-mongo-db-database-uri-here',
  dbName: 'webmentions', // Your db name
  mentionCollection: 'mentions', // The collection you want to use for parsed mentions
  pendingCollection: 'pendingMentions', // The collection you want to use for pending mentions
  maxPendingFetch: 100, // The maximum number of pending mentions to fetch at a time
  limitMentionsPerPageFetch: 50 // The maximum number of parsed mentions to fetch at a time
});
```
Pass your instance to webmention-handler.
```typescript
import { WebMentionHandler } from 'webmention-handler';

const options = {
  supportedHosts: ['localhost'] // The domain of any websites this handler should support
  storageHandler: storage, // pass in your storage handler instance
  requiredProtocol: 'https' // Not required, but highly recommended to only allow https mentions
};
export const webMentionHandler = new WebMentionHandler(options)
```
Follow the documentation for [Webmention-Handler](https://github.com/vandie/webmention-handler)