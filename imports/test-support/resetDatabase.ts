import { MongoInternals } from "meteor/mongo"

export const resetDatabase = async () => {
	await MongoInternals.defaultRemoteCollectionDriver().mongo.db.dropDatabase()
}


