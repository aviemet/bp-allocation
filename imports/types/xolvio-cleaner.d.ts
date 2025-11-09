declare module "meteor/xolvio:cleaner" {
	interface ResetDatabaseOptions {
		excludedCollections?: string[]
	}

	export function resetDatabase(options?: ResetDatabaseOptions): void
}

