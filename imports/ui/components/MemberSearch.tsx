import { useMembers } from "/imports/api/hooks"
import { type MemberData } from "/imports/api/db"

import TagIcon from "@mui/icons-material/Tag"
import {
	Autocomplete,
	type AutocompleteChangeReason,
	type AutocompleteProps,
	Box,
	Chip,
	TextField,
} from "@mui/material"
import { createFilterOptions } from "@mui/material/Autocomplete"
import { isEmpty } from "lodash"
import { Loading } from "/imports/ui/components"
import { type SyntheticEvent } from "react"

interface MemberSearchProps extends Omit<AutocompleteProps<MemberData, false, false, false>, "options" | "renderInput" | "onChange" | "value"> {
	value: MemberData | null
	setValue?: (value: MemberData | null) => void
	onResultSelect?: (value: MemberData | null) => void
}

const MemberSearch = ({ value, setValue, onResultSelect, ...props }: MemberSearchProps) => {
	const { members, membersLoading } = useMembers()

	const filterOptions = createFilterOptions<MemberData>({
		limit: 15,
		stringify: (option) => `${option.fullName} ${option.number}`,
	})

	const handleChange = (_event: SyntheticEvent, newValue: MemberData | null, _reason: AutocompleteChangeReason) => {
		if(setValue) setValue(newValue)
		if(onResultSelect) onResultSelect(newValue)
	}

	if(membersLoading || isEmpty(members)) return <Loading />
	return (
		<Autocomplete<MemberData>
			id="member-select-input"
			autoComplete
			blurOnSelect
			value={ value }
			clearText={ "" }
			onChange={ handleChange }
			options={ members }
			getOptionLabel={ (option) => option.fullName || "" }
			filterOptions={ filterOptions }
			renderOption={ (props, option) => {
				const { key, ...otherProps } = props
				return (
					<Box component="li" key={ key } sx={ { p: 2 } } { ...otherProps }>
						{ option.fullName } <Chip icon={ <TagIcon /> } label={ option.number } />
					</Box>
				)
			} }
			renderInput={ (params) => (
				<TextField
					variant="outlined"
					placeholder="Member Name or Number"
					{ ...params }
				/>
			) }
			{ ...props }
		/>
	)
}

export default MemberSearch
