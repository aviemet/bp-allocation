import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

declare module "meteor/mongo" {
	namespace Mongo {
		interface Collection<T, U = T> {
			attachSchema(schema: SimpleSchema): void
		}
	}
}
