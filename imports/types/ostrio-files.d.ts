declare module "meteor/ostrio:files" {
	import { Mongo } from "meteor/mongo"

	export interface FileData {
		name: string
		extension: string
		size: number
		type: string
		path?: string
		[key: string]: unknown
	}

	export interface FilesCollectionConfig {
		collectionName: string
		allowClientCode?: boolean
		downloadRoute?: string
		public?: boolean
		storagePath?: string
		onBeforeUpload?: (file: FileData) => boolean | string
		[key: string]: unknown
	}

	export class FilesCollection {
		constructor(config: FilesCollectionConfig)
		collection: Mongo.Collection<FileData>
		find: Mongo.Collection<FileData>["find"]
		findOneAsync: Mongo.Collection<FileData>["findOneAsync"]
		insert: Mongo.Collection<FileData>["insert"]
		allowClient(): void
		allow(options: {
			insert?: () => boolean
			update?: () => boolean
			remove?: () => boolean
		}): void
		[key: string]: unknown
	}
}

