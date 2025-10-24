import React from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@mui/material"

const ClearFormButton = () => {
	const { reset } = useFormContext()

	return (
		<Button onClick={ () => reset() }>Clear</Button>
	)
}

export default ClearFormButton
