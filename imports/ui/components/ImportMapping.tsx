import {
	Button,
	Chip,
	FormControl,
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
} from "@mui/material"
import { type SelectChangeEvent } from "@mui/material/Select"
import { styled } from "@mui/material/styles"
import { useState, Fragment } from "react"
import SimpleSchema from "simpl-schema"

type CsvRow = Record<string, unknown>

interface HeadingMapping {
	name: string
	label: string
	forms: string[]
	type?: (value: unknown) => unknown
}

interface ValidationErrorDetail {
	name: string
	type: string
	message: string
}

interface ImportMappingProps {
	headings: string[]
	values?: CsvRow[]
	mapping: HeadingMapping[]
	schema: SimpleSchema
	sanitize?: (row: CsvRow) => CsvRow
	onImport: (data: CsvRow[]) => void
}

const ImportMapping = ({ headings, values = [], mapping, schema, sanitize, onImport }: ImportMappingProps) => {
	const [errors, setErrors] = useState<Array<ValidationErrorDetail[] | undefined>>([])

	const alternateForm = (heading: string) => {
		for(let index = 0; index < mapping.length; index++) {
			if(mapping[index].forms.includes(heading.toLowerCase())) return mapping[index].name
		}
		return undefined
	}

	const [headingMap, setHeadingMap] = useState<Record<string, string | undefined>>(() => {
		const map: Record<string, string | undefined> = {}
		headings.forEach(heading => {
			// TODO: Handle case where 2 headings map to same field
			const inferredHeading = alternateForm(heading)
			map[heading] = inferredHeading
		})
		return map
	})

	const handleSelectChange = (event: SelectChangeEvent<string>, heading: string) => {
		const selectedValue = event.target.value
		setHeadingMap(previousHeadingMap => {
			const updatedHeadingMap: Record<string, string | undefined> = { ...previousHeadingMap }
			for(const [csvHeading, databaseField] of Object.entries(previousHeadingMap)) {
				if(databaseField === selectedValue) {
					updatedHeadingMap[csvHeading] = ""
				}
			}
			return {
				...updatedHeadingMap,
				[heading]: selectedValue,
			}
		})
		setErrors([])
	}

	// TODO: Consider creating an object up front from the mapping array to avoid iterating each value on every row
	const performImportAction = () => {
		const batchErrors: Array<ValidationErrorDetail[] | undefined> = []

		const validatedData = values.map((value, valueIndex) => {
			const context = schema.newContext()

			const row: CsvRow = {}
			for(const [csvHeading, databaseField] of Object.entries(headingMap)) {
				const fieldKey = databaseField === undefined ? String(databaseField) : databaseField
				if(fieldKey === "") continue

				const headingMapForType = mapping.find(map => map.name === headingMap[csvHeading])
				const cellValue = headingMapForType?.type ? headingMapForType.type(value[csvHeading]) : value[csvHeading]

				row[fieldKey] = cellValue
			}

			let sanitizedRow = row
			if(sanitize !== undefined) {
				sanitizedRow = sanitize(row)
			}

			if(!context.validate(sanitizedRow)) {
				batchErrors[valueIndex] = context.validationErrors().map(validationError => ({
					name: validationError.name,
					type: validationError.type,
					message: context.keyErrorMessage(validationError.name),
				}))
			}

			return sanitizedRow
		})

		if(batchErrors.length > 0) {
			setErrors(batchErrors)
		} else {
			onImport(validatedData)
		}
	}

	return (
		<>
			<Button onClick={ performImportAction }>Accept</Button>
			<TableContainer component={ Paper }>
				<Table>
					<TableHead>
						<TableRow>
							{ headings.map((heading, headingIndex) => (
								<TableCell key={ headingIndex }>
									<Stack direction="row" alignItems="baseline" spacing={ 2 } sx={ { whiteSpace: "nowrap", mb: 2 } }>
										<div>Heading From CSV:</div>
										<Chip label={ heading } />
									</Stack>
									<FormControl fullWidth>
										<Select
											labelId={ `${heading}-map-label` }
											id={ `${heading}-map` }
											size="small"
											onChange={ event => handleSelectChange(event, heading) }
											value={ headingMap[heading] ?? "" }
											displayEmpty={ true }
										>
											<MenuItem value=""><em style={ { color: "red" } }>Do Not Import</em></MenuItem>
											{ mapping.map((mappingOption, mappingIndex) => (
												<MenuItem key={ `option-${mappingOption.name}-${mappingIndex}` } value={ mappingOption.name }>{ mappingOption.label }</MenuItem>
											)) }
										</Select>
									</FormControl>
								</TableCell>
							)) }
						</TableRow>
						{ errors.length > 0 && <TableRow>
							<TableCell colSpan={ values.length } sx={ { backgroundColor: "red", color: "white" } }>
								There were errors in the data provided which prevented them from being saved. Please check the data and upload again.
							</TableCell>
						</TableRow> }
					</TableHead>
					<EnhancedTableBody>
						{ values.map((row, rowIndex) => (
							<Fragment key={ rowIndex }>
								<TableRow className={ errors[rowIndex] === undefined ? "" : "error" }>
									{ headings.map((heading, headingIndex) => {
										const headingMapForType = mapping.find(map => map.name === headingMap[heading])
										const cellValue = headingMapForType?.type ? headingMapForType.type(row[heading]) : row[heading]

										const error = errors[rowIndex] !== undefined && errors[rowIndex].find(validationError => validationError.name === headingMapForType?.name)
										return (
											<TableCell key={ `${headingIndex}-${heading}` } className={ error ? "error" : "" }>{ `${cellValue}` }</TableCell>
										)
									}) }
								</TableRow>
								{ errors[rowIndex] !== undefined && <TableRow>
									<TableCell colSpan={ values.length } sx={ { backgroundColor: "red", color: "white" } }>
										<div>Errors:</div>
										<ul>
											{ errors[rowIndex].map((validationError, validationErrorIndex) => <li key={ validationErrorIndex }>{ validationError.message }</li>) }
										</ul>
									</TableCell>
								</TableRow> }
							</Fragment>
						)) }
					</EnhancedTableBody>
				</Table>
			</TableContainer>
		</>
	)
}

const EnhancedTableBody = styled(TableBody)(({ theme }) => {
	return ({
		"tr.error": {
			borderLeft: `2px solid ${theme.palette.error.main}`,
		},
		"td.error": {
			backgroundColor: theme.palette.error.light,
		},
	})
})

export default ImportMapping
