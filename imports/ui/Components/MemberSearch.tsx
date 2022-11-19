import React from 'react'
import { isEmpty } from 'lodash'
import { observer } from 'mobx-react-lite'
import { useMembers } from '/imports/api/providers'

import {
	Autocomplete,
	Box,
	Chip,
	InputAdornment,
	TextField,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TagIcon from '@mui/icons-material/Tag'
import { Loading } from '/imports/ui/Components'

interface IMemberSearchProps {
	value: string
	setValue: (value: string) => void
	onResultSelect: Function
}

const MemberSearch = observer(({ value, setValue, onResultSelect, ...props }: IMemberSearchProps) => {
	const { members, isLoading: membersLoading } = useMembers()

	if(membersLoading || isEmpty(members)) return <Loading />
	return (
		<Autocomplete
			id="member-select-input"
			autoComplete
			blurOnSelect
			value={ value }
			onChange={ (event, newValue, reason)  => {
				if(setValue) setValue(newValue ?? '')
				if(onResultSelect) onResultSelect(newValue)
			} }
			options={ members.values }
			getOptionLabel={ option => option?.fullName || '' }
			clearText={ '' }
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
					InputProps={ {
						startAdornment: ( <InputAdornment position="start"><SearchIcon /></InputAdornment> ),
					} }
				/>
			) }
			{ ...props }
		/>
	)
})

export default MemberSearch
