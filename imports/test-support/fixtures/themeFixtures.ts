import { faker } from "@faker-js/faker"

import { PresentationSettingsMethods, ThemeMethods } from "/imports/api/methods"
import { Themes, type SettingsData, type ThemeData } from "/imports/api/db"

export interface TestThemeBundle {
	themeId: string
	theme: ThemeData
	presentationSettingsId: string
}

export interface TestThemeCreateInput {
	title?: string
}

export interface TestThemePreset {
	theme?: Partial<ThemeData>
	presentationSettings?: Partial<SettingsData>
}

export interface TestThemePresetOverrides {
	theme?: Partial<ThemeData>
	presentationSettings?: Partial<SettingsData>
}

export const TEST_THEME_PRESETS = {
	allocation: {
		theme: {
			leverageTotal: 1_000_000,
			consolationActive: false,
		},
	},
	crowdFavorite: {
		theme: {
			leverageTotal: 1_000_000,
			consolationActive: false,
		},
		presentationSettings: {
			useKioskFundsVoting: false,
		},
	},
	crowdFavoriteWithPledges: {
		theme: {
			leverageTotal: 1_000_000,
			consolationActive: false,
			matchRatio: 2,
		},
		presentationSettings: {
			useKioskFundsVoting: false,
		},
	},
	crowdFavoriteTightPool: {
		theme: {
			leverageTotal: 5000,
			consolationActive: false,
			matchRatio: 2,
		},
		presentationSettings: {
			useKioskFundsVoting: false,
		},
	},
	manualFundsVoting: {
		presentationSettings: {
			useKioskFundsVoting: false,
		},
	},
} as const satisfies Record<string, TestThemePreset>

export type TestThemePresetName = keyof typeof TEST_THEME_PRESETS

export const randomThemeTitle = (): string =>
	`${faker.company.buzzNoun()}-${faker.string.alpha(4)}`

export const insertTestTheme = async (
	createInput: TestThemeCreateInput = {},
	themeOverrides: Partial<ThemeData> = {},
): Promise<TestThemeBundle> => {
	const themeId = await ThemeMethods.create.callAsync({
		title: createInput.title ?? randomThemeTitle(),
	})
	if(!themeId) {
		throw new Error("insertTestTheme: ThemeMethods.create returned no id")
	}

	if(Object.keys(themeOverrides).length > 0) {
		await ThemeMethods.update.callAsync({ id: themeId, data: themeOverrides })
	}

	const theme = await Themes.findOneAsync({ _id: themeId })
	if(!theme?.presentationSettings) {
		throw new Error("insertTestTheme: theme missing presentationSettings")
	}

	return {
		themeId,
		theme,
		presentationSettingsId: theme.presentationSettings,
	}
}

export const loadTestThemeBundle = async (themeId: string): Promise<TestThemeBundle> => {
	const theme = await Themes.findOneAsync({ _id: themeId })
	if(!theme?.presentationSettings) {
		throw new Error("loadTestThemeBundle: theme missing presentationSettings")
	}
	return {
		themeId,
		theme,
		presentationSettingsId: theme.presentationSettings,
	}
}

export const applyTestThemePreset = async (
	themeId: string,
	presetName: TestThemePresetName,
	overrides: TestThemePresetOverrides = {},
): Promise<void> => {
	const preset: TestThemePreset = TEST_THEME_PRESETS[presetName]
	const themeData = { ...preset.theme ?? {}, ...overrides.theme }
	const settingsData = { ...preset.presentationSettings ?? {}, ...overrides.presentationSettings }

	if(Object.keys(themeData).length > 0) {
		await updateTestTheme(themeId, themeData)
	}
	if(Object.keys(settingsData).length > 0) {
		const bundle = await loadTestThemeBundle(themeId)
		await updateTestPresentationSettings(bundle.presentationSettingsId, settingsData)
	}
}

export const updateTestTheme = async (
	themeId: string,
	data: Partial<ThemeData>,
): Promise<void> => {
	await ThemeMethods.update.callAsync({ id: themeId, data })
}

export const updateTestPresentationSettings = async (
	settingsId: string,
	data: Partial<SettingsData>,
): Promise<void> => {
	await PresentationSettingsMethods.update.callAsync({ id: settingsId, data })
}
