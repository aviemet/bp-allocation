import React from 'react'
import createContext from '../../../lib/hooks/createContext'
import styled from '@emotion/styled'
import { Box, SxProps } from '@mui/material'
import { useWindowSize } from '/imports/ui/MediaProvider'

interface IOrgCardContainerProps {
	children: React.ReactNode[]
	cols: number
	sx: SxProps
}

const [useCardContext, CardContext] = createContext()
export { useCardContext }

const OrgCardContainer = ({ children, cols = 2, sx }: IOrgCardContainerProps) => {
	const { width } = useWindowSize()

	const responsiveColumns = (cols: number) => {
		if(width < 600) {
			return 1
		} else if(width < 1024) {
			return Math.min(cols, 2)
		}
		return cols
	}

	return (
		<StyledOrgCardContainer cols={ responsiveColumns(cols) } orphans={ children.length % cols } sx={ sx }>
			<CardContext value={ { cols } }>
				{ children }
			</CardContext>
		</StyledOrgCardContainer>
	)
}

const gap = 16
const StyledOrgCardContainer = styled(Box)((
	{ cols, orphans }: { cols: number, orphans: number },
) => ({
	display: 'grid',
	gap: `${gap}px`,
	gridAutoRows: '1fr',
	gridTemplateColumns: `repeat(${cols * 2}, 1fr)`,

	'.orgCard': {
		gridColumn: 'span 2',

		[`&:nth-last-of-type(${orphans})`]: {
			gridColumnEnd: 1 - cols - orphans,
		},
	},
}))

export default OrgCardContainer
