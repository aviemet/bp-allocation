import { Meteor } from "meteor/meteor"

import { MemberThemes } from "/imports/api/db"
import { createDebouncedFunction } from "/imports/lib/utils"
import { type MemberTheme } from "/imports/types/schema"
import { createCoalescedRefresh } from "/imports/server/publications/publicationRefreshCoalesce"
import {
	recordPublicationListenerInvocation,
	recordPublicationRefreshTrigger,
	setCoordinatorListenerCountMetric,
	trackPublicationRefresh,
} from "/imports/server/publications/publicationRefreshMetrics"

type Listener = (memberThemes: MemberTheme[]) => void

interface ThemeCoordinatorState {
	listeners: Map<number, Listener>
	nextListenerId: number
	debouncedNotify: ReturnType<typeof createDebouncedFunction>
	coalescedNotify: ReturnType<typeof createCoalescedRefresh>
	watcher: Meteor.LiveQueryHandle | undefined
}

const DEBOUNCE_MS = 100

const coordinatorsByThemeId = new Map<string, ThemeCoordinatorState>()

const refreshCoordinatorListenerCountMetric = (): void => {
	let total = 0
	for(const state of coordinatorsByThemeId.values()) {
		total += state.listeners.size
	}
	setCoordinatorListenerCountMetric(total)
}

async function fetchMemberThemesAndNotify(themeId: string): Promise<void> {
	recordPublicationRefreshTrigger("coordinator.notify")
	await trackPublicationRefresh("coordinator.notify", async () => {
		const current = coordinatorsByThemeId.get(themeId)
		if(!current || current.listeners.size === 0) {
			return
		}
		const rows = await MemberThemes.find({ theme: themeId }).fetchAsync()
		for(const listener of current.listeners.values()) {
			recordPublicationListenerInvocation("coordinator.notify")
			listener(rows)
		}
	})
}

function getOrCreateState(themeId: string): ThemeCoordinatorState {
	let state = coordinatorsByThemeId.get(themeId)
	if(state) {
		return state
	}
	const coalescedNotify = createCoalescedRefresh()
	state = {
		listeners: new Map(),
		nextListenerId: 1,
		coalescedNotify,
		debouncedNotify: createDebouncedFunction(() => {
			coalescedNotify.schedule(() => fetchMemberThemesAndNotify(themeId))
		}, DEBOUNCE_MS),
		watcher: undefined,
	}
	coordinatorsByThemeId.set(themeId, state)
	return state
}

function ensureWatcher(themeId: string, state: ThemeCoordinatorState): void {
	if(state.watcher) {
		return
	}
	state.watcher = MemberThemes.find({ theme: themeId }).observeChanges({
		added: () => {
			state.debouncedNotify()
		},
		changed: () => {
			state.debouncedNotify()
		},
		removed: () => {
			state.debouncedNotify()
		},
	})
}

export function getMemberThemesCoordinatorListenerCount(themeId?: string): number {
	if(themeId) {
		return coordinatorsByThemeId.get(themeId)?.listeners.size ?? 0
	}
	let total = 0
	for(const state of coordinatorsByThemeId.values()) {
		total += state.listeners.size
	}
	return total
}

export function registerMemberThemesRefreshListener(themeId: string, listener: Listener): () => void {
	const state = getOrCreateState(themeId)
	const listenerId = state.nextListenerId++
	state.listeners.set(listenerId, listener)
	ensureWatcher(themeId, state)
	refreshCoordinatorListenerCountMetric()

	return () => {
		const current = coordinatorsByThemeId.get(themeId)
		if(!current) {
			return
		}
		current.listeners.delete(listenerId)
		if(current.listeners.size > 0) {
			refreshCoordinatorListenerCountMetric()
			return
		}
		current.debouncedNotify.cancel()
		if(current.watcher && typeof current.watcher.stop === "function") {
			current.watcher.stop()
		}
		coordinatorsByThemeId.delete(themeId)
		refreshCoordinatorListenerCountMetric()
	}
}
