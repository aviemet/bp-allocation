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
			styleOverrides: {
				root: ({ theme }) => ({
					"&.Mui-disabled": {
						backgroundColor: theme.palette.grey[900],
						color: "#999",
					},
				}),
			},
		},
		MuiTable: {
			styleOverrides: {
				root: ({ theme }) => ({
					borderCollapse: "collapse",
					"&.striped > tbody > tr:nth-of-type(2n)": {
						backgroundColor: theme.palette.grey[100],
					},
					"&.striped-collapse > tbody > tr:nth-of-type(4n), &.striped-collapse > tbody > tr:nth-of-type(4n-1)": {
						backgroundColor: theme.palette.grey[100],
					},
				}),
			},
		},
		MuiTableHead: {
			styleOverrides: {
				root: ({ theme }) => ({
					backgroundColor: theme.palette.grey[100],
					"& > th": {
						borderRight: theme.palette.grey[200],
					},
				}),
			},
		},
		MuiTableRow: {
			styleOverrides: {
				root: ({ theme }) => ({
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
		MuiTooltip: {
			defaultProps: {
				arrow: true,
			},
		},
		MuiAppBar: {
			styleOverrides: {
				colorInherit: {
					backgroundColor: "#002b45",
					color: "#fff",
				},
			},
		},
	},
	typography: {
		fontFamily: "Roboto",
	},
})

export default theme
