import React, { useEffect, useState } from "react"
import MemberSearch from "/imports/ui/components/MemberSearch"
import { useFormContext, useWatch } from "react-hook-form"

const MemberSearchInput = () => {
	const { setValue } = useFormContext()
	const { member } = useWatch()
	const [inputValue, setInputValue] = useState("")

	const handleSetValue = member => {
		setInputValue(member ?? "")
		setValue("member", member ? member._id : "")
	}

	useEffect(() => {
		if(member === "") setInputValue("member", "")
	}, [member])

	return (
		<MemberSearch
			value={ inputValue }
			setValue={ handleSetValue }
		/>
	)
}

export default MemberSearchInput

// onResultSelect={ handleResultSelect }
