declare module "meteor/ostrio:files" {
	import { Mongo } from "meteor/mongo"

	export interface FileData {
		name: string
		extension: string
		size: number
		type: string
		path?: string
		link?: () => string
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

	export interface UploadInstance {
		on(event: "start", callback: () => void): UploadInstance
		on(event: "progress", callback: (progress: number, fileObj: FileData) => void): UploadInstance
		on(event: "uploaded", callback: (error: Error | null, fileObj: FileData) => void): UploadInstance
		on(event: "end", callback: (error: Error | null, fileObj: FileData) => void): UploadInstance
		on(event: "error", callback: (error: Error, fileObj: FileData) => void): UploadInstance
		on(event: string, callback: (...args: unknown[]) => void): UploadInstance
		start: () => void
	}

	export interface InsertOptions {
		file: File
		meta?: Record<string, unknown>
	}

	export class FilesCollection {
		constructor(config: FilesCollectionConfig)
		collection: Mongo.Collection<FileData>
		find: Mongo.Collection<FileData>["find"]
		findOneAsync: Mongo.Collection<FileData>["findOneAsync"]
		insert: (options: InsertOptions) => UploadInstance
		allowClient(): void
		allow(options: {
			insert?: () => boolean
			update?: () => boolean
			remove?: () => boolean
		}): void
		[key: string]: unknown
	}
}

