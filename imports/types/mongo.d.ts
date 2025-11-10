// Extended MongoDB type definitions to support complex $pull operations
// that are valid in MongoDB but not covered by the default Meteor types

declare module "meteor/mongo" {
	namespace Mongo {
		interface RemoteCollectionDriver {
			mongo: {
				db: {
					dropDatabase(): Promise<void>
				}
			}
		}

		// Simple enhanced modifier that allows complex $pull operations
		type EnhancedModifier<T> = {
			$pull?: { [key: string]: any }
			[key: string]: any
		}

		// Add overloads to Collection methods to accept EnhancedModifier
		interface Collection<T, U = T> {
			update(
				selector: any,
				modifier: EnhancedModifier<T>,
				options?: any,
				callback?: Function,
			): number

			updateAsync(
				selector: any,
				modifier: EnhancedModifier<T>,
				options?: any,
				callback?: Function,
			): Promise<number>

			upsert(
				selector: any,
				modifier: EnhancedModifier<T>,
				options?: any,
				callback?: Function,
			): any

			upsertAsync(
				selector: any,
				modifier: EnhancedModifier<T>,
				options?: any,
				callback?: Function,
			): Promise<any>
		}
	}

	interface MongoInternalsStatic {
		defaultRemoteCollectionDriver(): Mongo.RemoteCollectionDriver
	}

	export const MongoInternals: MongoInternalsStatic
}
