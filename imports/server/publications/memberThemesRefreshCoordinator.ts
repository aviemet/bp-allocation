import { Meteor } from "meteor/meteor"

import { MemberThemes } from "/imports/api/db"
import { createDebouncedFunction } from "/imports/lib/utils"
import { type MemberTheme } from "/imports/types/schema"

type Listener = (memberThemes: MemberTheme[]) => void

interface ThemeCoordinatorState {
	listeners: Map<number, Listener>
	nextListenerId: number
	debouncedNotify: ReturnType<typeof createDebouncedFunction>
	watcher: Meteor.LiveQueryHandle | undefined
}

const DEBOUNCE_MS = 100

const coordinatorsByThemeId = new Map<string, ThemeCoordinatorState>()

async function fetchMemberThemesAndNotify(themeId: string): Promise<void> {
	const current = coordinatorsByThemeId.get(themeId)
	if(!current || current.listeners.size === 0) {
		return
	}
	const rows = await MemberThemes.find({ theme: themeId }).fetchAsync()
	for(const listener of current.listeners.values()) {
		listener(rows)
	}
}

function getOrCreateState(themeId: string): ThemeCoordinatorState {
	let state = coordinatorsByThemeId.get(themeId)
	if(state) {
		return state
	}
	state = {
		listeners: new Map(),
		nextListenerId: 1,
		debouncedNotify: createDebouncedFunction(() => {
			void fetchMemberThemesAndNotify(themeId)
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

export function registerMemberThemesRefreshListener(themeId: string, listener: Listener): () => void {
	const state = getOrCreateState(themeId)
	const listenerId = state.nextListenerId++
	state.listeners.set(listenerId, listener)
	ensureWatcher(themeId, state)

	return () => {
		const current = coordinatorsByThemeId.get(themeId)
		if(!current) {
			return
		}
		current.listeners.delete(listenerId)
		if(current.listeners.size > 0) {
			return
		}
		current.debouncedNotify.cancel()
		if(current.watcher && typeof current.watcher.stop === "function") {
			current.watcher.stop()
		}
		coordinatorsByThemeId.delete(themeId)
	}
}
