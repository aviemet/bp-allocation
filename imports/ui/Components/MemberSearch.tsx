import React from "react"
import PropTypes from "prop-types"
import { isEmpty } from "lodash"
import { observer } from "mobx-react-lite"
import { useMembers } from "/imports/api/providers"
import { createFilterOptions } from "@mui/material/Autocomplete"

import {
	Autocomplete,
	Box,
	Chip,
	InputAdornment,
	TextField,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import TagIcon from "@mui/icons-material/Tag"
import { Loading } from "/imports/ui/Components"
import { toJS } from "mobx"

const MemberSearch = observer(({ value, setValue, onResultSelect, ...props }) => {
	const { members, isLoading: membersLoading } = useMembers()

	const filterOptions = createFilterOptions({
		limit: 15,
		stringify: (option) => `${option.fullName} ${option.number}`,
	})

	const handleChange = (event, newValue, reason) => {
		if(setValue) setValue(newValue)
		if(onResultSelect) onResultSelect(newValue)
	}

	if(membersLoading || isEmpty(members)) return <Loading />
	return (
		<Autocomplete
			id="member-select-input"
			autoComplete
			blurOnSelect
			value={ value }
			clearText={ "" }
			onChange={ handleChange }
			options={ toJS(members.values) }
			getOptionLabel={ option => option?.fullName || "" }
			filterOptions={ filterOptions }
			renderOption={ (props, option) => (
				<Box component="li" sx={ { p: 2 } } { ...props }>
					{ option?.fullName } <Chip icon={ <TagIcon /> } label={ option?.number } />
				</Box>
			) }
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
})

MemberSearch.propTypes = {
	onResultSelect: PropTypes.func,
	rest: PropTypes.any,
}

export default MemberSearch
