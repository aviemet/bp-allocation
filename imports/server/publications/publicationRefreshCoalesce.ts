export type CoalescedRefreshSchedule = (work: () => Promise<void>) => void

export interface CoalescedRefreshController {
	schedule: CoalescedRefreshSchedule
	isInFlight: () => boolean
	isPending: () => boolean
}

export const createCoalescedRefresh = (): CoalescedRefreshController => {
	let inFlight = false
	let pending = false
	let latestWork: (() => Promise<void>) | undefined

	const runLoop = async (): Promise<void> => {
		inFlight = true
		while(true) {
			pending = false
			const work = latestWork
			latestWork = undefined
			if(work) {
				await work()
			}
			if(!pending) {
				inFlight = false
				return
			}
		}
	}

	const schedule: CoalescedRefreshSchedule = work => {
		latestWork = work
		if(inFlight) {
			pending = true
			return
		}
		void runLoop()
	}

	return {
		schedule,
		isInFlight: () => inFlight,
		isPending: () => pending,
	}
}
