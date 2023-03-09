import { type PaletteOptions, type SvgIconTypeMap } from "@mui/material";
import { type OverridableComponent } from "@mui/material/OverridableComponent";

declare global {
	type Icon = OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
		muiName: string;
	}
}

declare module '@mui/material/styles' {
  // allow configuration using `createTheme`

	interface PaletteOptions {
		table?: PaletteColorOptions
		batteryBlue?: PaletteColorOptions
		batteryGreen?: PaletteColorOptions
	}

	interface PaletteColorOptions {
		highlight?: string
		main?: string
		stripe?: string
		header?: string
		dark?: string
		contrastText?: string
	}

	interface TablePropsVariantOverrides {
    striped: true;
		'striped-collapse': true
  }

}
