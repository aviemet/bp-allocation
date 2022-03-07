import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import styled from '@emotion/styled'
import {
	Button,
	Chip,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
} from '@mui/material'

const ImportMapping = ({ headings, values, mapping, schema, onImport }) => {
	const [errors, setErrors] = useState([])

	const alternateForm = heading => {
		for(let i = 0; i < mapping.length; i++) {
			if(mapping[i].forms.includes(heading.toLowerCase())) return mapping[i].name
		}
	}

	const [headingMap, setHeadingMap] = useState(() => {
		const map = {}
		headings.forEach(heading => {
			// TODO: Handle case where 2 headings map to same field
			const inferredHeading =  alternateForm(heading)
			map[heading] = inferredHeading
		})
		return map
	})

	const handleSelectChange = (value, heading) =>  {
		setHeadingMap(prevState => {
			const newState = prevState

			for(const [csvHeading, dbField] of Object.entries(headingMap)) {
				if(dbField === value) {
					newState[csvHeading] = ''
				}
			}

			return {
				...newState,
				[heading]: value
			}
		})
	}

	// TODO: Consider creating an object up front from the mapping array to avoid iterating each value on every row
	const performImportAction = () => {
		const batchErrors = []

		const validatedData = values.map((value, i) => {
			const context = schema.newContext()

			const row = {}
			for(const [csvHeading, dbField] of Object.entries(headingMap)) {
				if(dbField === '') continue

				const headingMapForType = mapping.find(map => map.name === headingMap[csvHeading])
				const cellValue = headingMapForType?.type ? headingMapForType.type(value[csvHeading]) : value[csvHeading]

				row[dbField] = cellValue
			}

			if(!context.validate(row)) {
				batchErrors[i] = context.validationErrors().map(({ name, type }) => ({
					name,
					type,
					message: context.keyErrorMessage(name),
				}))
			}

			return row
		})

		if(batchErrors.length > 0) {
			setErrors(batchErrors)
		} else {
			onImport(validatedData)
		}

	}

	useEffect(() => {
		if(errors.length > 0) console.error({ errors })
	}, [errors])

	useEffect(() => {
		setErrors([])
		console.log({ headingMap })
	}, [headingMap])

	return (
		<>
			<Button onClick={ performImportAction }>Accept</Button>
			<TableContainer component={ Paper }>
				<Table>
					<TableHead>
						<TableRow>
							{ headings.map((heading, i) => (
								<TableCell key={ i }>
									<Stack direction="row" alignItems="baseline" spacing={ 2 } sx={ { whiteSpace: 'nowrap', mb: 2 } }>
										<div>Heading From CSV:</div>
										<Chip label={ heading } />
									</Stack>
									<FormControl fullWidth>
										<Select
											labelId={ `${heading}-map-label` }
											id={ `${heading}-map` }
											size="small"
											onChange={ e => handleSelectChange(e.target.value, heading) }
											value={ headingMap[heading] }
											displayEmpty={ true }
										>
											<MenuItem value=""><em style={ { color: 'red' } }>Do Not Import</em></MenuItem>
											{ mapping.map((h, j) => (
												<MenuItem key={ `option-${h}-${j}` } value={ h.name }>{ h.label }</MenuItem>
											)) }
										</Select>
									</FormControl>
								</TableCell>
							)) }
						</TableRow>
						{ errors.length > 0 && <TableRow>
							<TableCell colSpan={ values.length } sx={ { backgroundColor: 'red', color: 'white' } }>
								There were errors in the data provided which prevented them from being saved. Please check the data and upload again.
							</TableCell>
						</TableRow> }
					</TableHead>
					<EnhancedTableBody>
						{ values.map((org, i) => (
							<React.Fragment key={ i }>
								<TableRow className={ errors[i] === undefined ? '' : 'error' }>
									{ headings.map((heading, j) => {
										const headingMapForType = mapping.find(map => map.name === headingMap[heading])
										const cellValue = headingMapForType?.type ? headingMapForType.type(org[heading]) : org[heading]

										const error = errors[i] !== undefined && errors[i].find(error => error.name === headingMapForType?.name)
										if(error) console.log({ org, i, heading, headingMapForType, error: errors[i] })
										return (
											<TableCell key={ `${j}-${heading}` } className={ error ? 'error' : '' }>{ `${cellValue}` }</TableCell>
										)
									})}
								</TableRow>
								{ errors[i] !== undefined && <TableRow>
									<TableCell colSpan={ values.length } sx={ { backgroundColor: 'red', color: 'white' } }>
										<div>Errors:</div>
										<ul>
											{ errors[i].map((error, k) => <li key={ k }>{ error.message }</li>) }
										</ul>
									</TableCell>
								</TableRow> }
							</React.Fragment>
						))}
					</EnhancedTableBody>
				</Table>
			</TableContainer>
		</>
	)
}

const EnhancedTableBody = styled(TableBody)(({ theme }) => {
	return({
		'tr.error': {
			borderLeft: `2px solid ${theme.palette.error.main}`
		},
		'td.error': {
			backgroundColor: theme.palette.error.light
		}
	})
})

ImportMapping.propTypes = {
	headings: PropTypes.array.isRequired,
	values: PropTypes.array,
	mapping: PropTypes.array.isRequired,
	schema: PropTypes.object.isRequired,
	onImport: PropTypes.func.isRequired,
	// errors: PropTypes.array,
}

ImportMapping.defaultProps = {
	values: [],
}

export default ImportMapping