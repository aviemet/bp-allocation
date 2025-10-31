import { Button } from "@mui/material"
import { useFormContext } from "react-hook-form"

const ClearFormButton = () => {
	const { reset } = useFormContext()

	return (
		<Button onClick={ () => reset() }>Clear</Button>
	)
}

export default ClearFormButton
