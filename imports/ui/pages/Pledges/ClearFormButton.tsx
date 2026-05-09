import { Button } from "@mui/material"
import { useFormContext } from "react-hook-form"

export const ClearFormButton = () => {
	const { reset } = useFormContext()

	return (
		<Button onClick={ () => reset() }>Clear</Button>
	)
}

