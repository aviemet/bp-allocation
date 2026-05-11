import { MongoInternals } from "meteor/mongo"

const PRESERVED_COLLECTIONS = new Set([
	"users",
])

export const resetDatabase = async () => {
	const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db
	const collections = await db.listCollections({}, { nameOnly: true }).toArray()

	await Promise.all(
		collections
			.filter(({ name }) => !name.startsWith("system.") && !PRESERVED_COLLECTIONS.has(name))
			.map(({ name }) => db.collection(name).deleteMany({}))
	)
}
