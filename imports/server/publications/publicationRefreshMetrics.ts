export type PublicationRefreshName =
	| "coordinator.notify"
	| "themes.refresh"
	| "organizations.refresh"
	| "orgPledgeFunding.refresh"
	| "members.refresh"
	| "member.refresh"
	| string

export interface PublicationRefreshBucket {
	triggerCount: number
	startedCount: number
	completedCount: number
	inFlight: number
	maxInFlight: number
	durationsMs: number[]
	changedEmissions: number
	listenerInvocations: number
}

export interface PublicationRefreshMetricsSnapshot {
	byName: Record<string, PublicationRefreshBucket>
	totalListenerInvocations: number
	maxInFlightAny: number
	coordinatorListenerCount: number
}

const buckets = new Map<string, PublicationRefreshBucket>()
let totalListenerInvocations = 0
let maxInFlightAny = 0
let coordinatorListenerCount = 0

const emptyBucket = (): PublicationRefreshBucket => ({
	triggerCount: 0,
	startedCount: 0,
	completedCount: 0,
	inFlight: 0,
	maxInFlight: 0,
	durationsMs: [],
	changedEmissions: 0,
	listenerInvocations: 0,
})

const getBucket = (name: PublicationRefreshName): PublicationRefreshBucket => {
	let bucket = buckets.get(name)
	if(!bucket) {
		bucket = emptyBucket()
		buckets.set(name, bucket)
	}
	return bucket
}

export const resetPublicationRefreshMetrics = (): void => {
	buckets.clear()
	totalListenerInvocations = 0
	maxInFlightAny = 0
	coordinatorListenerCount = 0
}

export const setCoordinatorListenerCountMetric = (count: number): void => {
	coordinatorListenerCount = count
}

export const recordPublicationRefreshTrigger = (name: PublicationRefreshName): void => {
	getBucket(name).triggerCount += 1
}

export const recordPublicationListenerInvocation = (name: PublicationRefreshName = "coordinator.notify"): void => {
	totalListenerInvocations += 1
	getBucket(name).listenerInvocations += 1
}

export const recordPublicationChangedEmissions = (name: PublicationRefreshName, count: number): void => {
	getBucket(name).changedEmissions += count
}

export const trackPublicationRefresh = async <T>(
	name: PublicationRefreshName,
	work: () => Promise<T>,
): Promise<T> => {
	const bucket = getBucket(name)
	bucket.startedCount += 1
	bucket.inFlight += 1
	if(bucket.inFlight > bucket.maxInFlight) {
		bucket.maxInFlight = bucket.inFlight
	}
	if(bucket.inFlight > maxInFlightAny) {
		maxInFlightAny = bucket.inFlight
	}
	const startedAt = Date.now()
	try {
		return await work()
	} finally {
		bucket.inFlight -= 1
		bucket.completedCount += 1
		bucket.durationsMs.push(Date.now() - startedAt)
	}
}

const percentile = (sorted: number[], ratio: number): number => {
	if(sorted.length === 0) {
		return 0
	}
	const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))
	return sorted[index]
}

export const summarizeDurations = (durationsMs: number[]): { p50: number, p95: number, max: number } => {
	if(durationsMs.length === 0) {
		return { p50: 0, p95: 0, max: 0 }
	}
	const sorted = [...durationsMs].sort((left, right) => left - right)
	return {
		p50: percentile(sorted, 0.5),
		p95: percentile(sorted, 0.95),
		max: sorted[sorted.length - 1],
	}
}

export const getPublicationRefreshMetrics = (): PublicationRefreshMetricsSnapshot => {
	const byName: Record<string, PublicationRefreshBucket> = {}
	for(const [name, bucket] of buckets.entries()) {
		byName[name] = {
			...bucket,
			durationsMs: [...bucket.durationsMs],
		}
	}
	return {
		byName,
		totalListenerInvocations,
		maxInFlightAny,
		coordinatorListenerCount,
	}
}

export const formatPublicationRefreshMetrics = (snapshot: PublicationRefreshMetricsSnapshot): string => {
	const lines = [
		`coordinatorListenerCount=${snapshot.coordinatorListenerCount}`,
		`totalListenerInvocations=${snapshot.totalListenerInvocations}`,
		`maxInFlightAny=${snapshot.maxInFlightAny}`,
	]
	const names = Object.keys(snapshot.byName).sort()
	for(const name of names) {
		const bucket = snapshot.byName[name]
		const durations = summarizeDurations(bucket.durationsMs)
		lines.push(
			`${name}: triggers=${bucket.triggerCount} started=${bucket.startedCount} completed=${bucket.completedCount} maxInFlight=${bucket.maxInFlight} listenerInvocations=${bucket.listenerInvocations} changedEmissions=${bucket.changedEmissions} p50=${durations.p50}ms p95=${durations.p95}ms max=${durations.max}ms`,
		)
	}
	return lines.join("\n")
}
