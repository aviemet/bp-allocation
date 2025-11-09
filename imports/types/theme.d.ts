import "@mui/material/styles"
import "@mui/material/Table"

interface ScreenBreakpoints {
	mobileS: number
	mobileM: number
	mobileL: number
	tablet: number
	tabletL: number
	laptop: number
	laptopL: number
	desktop: number
	desktopL: number
}

declare module "@mui/material/styles" {
	interface Theme {
		screen: ScreenBreakpoints
	}

	interface ThemeOptions {
		screen?: ScreenBreakpoints
	}

	interface Palette {
		batteryBlue: Palette["primary"]
		batteryGreen: Palette["primary"]
		table: {
			stripe: string
			highlight: string
			header: string
		}
	}

	interface PaletteOptions {
		batteryBlue?: PaletteOptions["primary"]
		batteryGreen?: PaletteOptions["primary"]
		table?: {
			stripe?: string
			highlight?: string
			header?: string
		}
	}

	interface PaletteColor {
		highlight?: string
	}

	interface SimplePaletteColorOptions {
		highlight?: string
	}
}

declare module "@mui/material/Table" {
	interface TablePropsVariantOverrides {
		striped: true
		"striped-collapse": true
	}
}

