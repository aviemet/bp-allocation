import { createTheme } from "@mui/material/styles"

const GREEN = "#0D8744"
const BLUE = "#002B43"

export const screen = {
	mobileS: 320,
	mobileM: 375,
	mobileL: 425,
	tablet: 768,
	tabletL: 992,
	laptop: 1024,
	laptopL: 1440,
	desktop: 1920,
	desktopL: 2560,
}

const theme = createTheme({
	screen,
	palette: {
		success: {
			highlight: "#e1fbe2",
			main: "#168341",
		},
		table: {
			stripe: "#EEE",
			highlight: "#edf6ff",
			header: "#DDD",
		},
		batteryBlue: {
			main: BLUE,
			dark: "#002B43",
			contrastText: "#FEFEFE",
		},
		batteryGreen: {
			main: GREEN,
			dark: "#0E532D",
			contrastText: "#FEFEFE",
		},
	},
	components: {
		MuiButton: {
			defaultProps: {
				variant: "contained",
			},
		},
		MuiTable: {
			styleOverrides: {
				root: {
					borderCollapse: "collapse",
				},
			},
			variants: [
				{
					props: { variant: "striped" },
					style: ({ ownerState, theme }) => ({
						"& > tbody > tr:nth-of-type(2n)": {
							backgroundColor: theme.palette.grey[100],
						},
					}),
				},
				{
					props: { variant: "striped-collapse" },
					style: ({ ownerState, theme }) => ({
						"& > tbody > tr:nth-of-type(4n), & > tbody > tr:nth-of-type(4n-1)": {
							backgroundColor: theme.palette.grey[100],
						},
					}),
				},
			],
		},
		MuiTableHead: {
			styleOverrides: {
				root: ({ ownerState, theme }) => ({
					backgroundColor: theme.palette.grey[100],
					"& > th": {
						borderRight: theme.palette.grey[200],
					},
				}),
			},
		},
		MuiTableRow: {
			styleOverrides: {
				root: ({ ownerState, theme }) => ({
					"&:first-of-type": {
						borderLeft: `1px solid ${theme.palette.grey[200]}`,
					},
				}),
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: {
					fontSize: "1rem",
				},
				head: {
					fontSize: "1.2rem",
				},
				footer: ({ ownerState, theme }) => ({
					fontSize: "1.2rem",
					textAlign: ownerState.align,
					fontWeight: 500,
					color: theme.palette.text.primary,
				}),
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: ({ theme }) => ({
					width: "100%",
					backgroundColor: theme.palette.common.white,
				}),
			},
		},
	},
	typography: {
		fontFamily: "Roboto",
	},
	props: {
		MuiTooltip: {
			arrow: true,
		},
	},
	overrides: {
		MuiAppBar: {
			colorInherit: {
				backgroundColor: "#002b45",
				color: "#fff",
			},
		},
	},
})

export default theme
