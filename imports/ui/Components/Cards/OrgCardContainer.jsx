import React, { createContext, useContext } from 'react'
import PropTypes from 'prop-types'
import styled from '@emotion/styled'
import { Box } from '@mui/material'
import { useWindowSize } from '/imports/ui/MediaProvider'

const CardContext = createContext()
export const useCardContext = () => useContext(CardContext)

const OrgCardContainer = ({ children, cols, sx }) => {
	const { width } = useWindowSize()

	const responsiveColumns = (cols) => {
		if(width < 600) {
			return 1
		} else if(width < 1024) {
			return Math.min(cols, 2)
		}
		return cols
	}

	return (
		<StyledOrgCardContainer cols={ responsiveColumns(cols) } orphans={ children.length % cols } sx={ sx }>
			<CardContext.Provider value={ { cols } }>
				{ children }
			</CardContext.Provider>
		</StyledOrgCardContainer>
	)
}

const gap = 16
const StyledOrgCardContainer = styled(Box)(({ theme, cols, orphans }) => ({
	display: 'grid',
	gap: `${gap}px`,
	gridAutoRows: '1fr',
	'.MuiBox-root': {
		height: '100%',
	},
	gridTemplateColumns: `repeat(${cols * 2}, 1fr)`,

	'.orgCard': {
		gridColumn: 'span 2',

		[`&:nth-last-of-type(${orphans})`]: {
			gridColumnEnd: 1 - cols - orphans
		}
	}
}))

OrgCardContainer.propTypes = {
	children: PropTypes.any,
	cols: PropTypes.number,
	sx: PropTypes.any,
}

OrgCardContainer.defaultProps = {
	cols: 2,
}

export default OrgCardContainer