import styled from "@emotion/styled"
import { Box, type SxProps, type Theme } from "@mui/material"
import { createContext, useContext, type ReactNode } from "react"
import { useWindowSize } from "/imports/ui/MediaProvider"

interface CardContextValue {
	cols: number
}

const CardContext = createContext<CardContextValue>({ cols: 2 })
export const useCardContext = () => useContext(CardContext)

interface OrgCardContainerProps {
	children: ReactNode
	cols?: number
	sx?: SxProps<Theme>
}

const OrgCardContainer = ({ children, cols = 2, sx }: OrgCardContainerProps) => {
	const { width } = useWindowSize()

	const responsiveColumns = (cols: number): number => {
		if(!width) return cols
		if(width < 600) {
			return 1
		} else if(width < 1024) {
			return Math.min(cols, 2)
		}
		return cols
	}

	const responsiveCols = responsiveColumns(cols)
	const orphans = Array.isArray(children) ? children.length % responsiveCols : responsiveCols

	return (
		<StyledOrgCardContainer cols={ responsiveCols } orphans={ orphans } sx={ sx }>
			<CardContext.Provider value={ { cols: responsiveCols } }>
				{ children }
			</CardContext.Provider>
		</StyledOrgCardContainer>
	)
}

const gap = 16

interface StyledOrgCardContainerProps {
	cols: number
	orphans: number
}

const StyledOrgCardContainer = styled(Box)<StyledOrgCardContainerProps>(({ cols, orphans }) => ({
	display: "grid",
	gap: `${gap}px`,
	gridAutoRows: "1fr",
	gridTemplateColumns: `repeat(${cols * 2}, 1fr)`,

	".orgCard": {
		gridColumn: "span 2",

		[`&:nth-last-of-type(${orphans})`]: {
			gridColumnEnd: 1 - cols - orphans,
		},
	},
}))

export default OrgCardContainer
