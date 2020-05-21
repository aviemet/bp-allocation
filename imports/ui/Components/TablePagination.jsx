import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Grid, Pagination } from 'semantic-ui-react'

const TablePagination = props => {
	const [ page, setPage ] = useState(props.defaultActivePage || 0)

	const onPageChange = (e, { activePage }) => {
		setPage(activePage - 1)
		if(props.onPageChange) {
			props.onPageChange(activePage - 1)
		}
	}

	const startRecord = (page * props.itemsPerPage) + 1
	const endRecord = (page + 1) * props.itemsPerPage < props.totalRecords ? (page + 1) * props.itemsPerPage : props.totalRecords

	return(
		<Grid>
			<Grid.Column width={ 3 }>
				<p>Showing { startRecord }-{ endRecord } of { props.totalRecords }</p>
			</Grid.Column>

			<Grid.Column width={ 7 }>
				{ props.children }
			</Grid.Column>


			<Grid.Column width={ 6 } textAlign='right'>
				{ props.totalRecords / props.itemsPerPage > 1 && 
				<Pagination
					activePage={ page + 1 }
					firstItem={ null }
					lastItem={ null }
					pointing
					secondary
					totalPages={ parseInt(props.totalRecords / props.itemsPerPage) + 1 } 
					onPageChange={ onPageChange }
				/> }		
			</Grid.Column>
		</Grid>
	)
}

TablePagination.propTypes = {
	onPageChange: PropTypes.func,
	defaultActivePage: PropTypes.number,
	totalRecords: PropTypes.number.isRequired,
	itemsPerPage: PropTypes.number.isRequired,
	children: PropTypes.any
}

export default TablePagination