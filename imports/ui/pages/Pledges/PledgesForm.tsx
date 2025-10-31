import styled from "@emotion/styled"
import { Button, Grid, InputAdornment, Stack } from "@mui/material"
import { observer } from "mobx-react-lite"
import { useState, useEffect } from "react"
import { useOrgs } from "/imports/api/providers"
import { TextInput, SubmitButton, STATUS, SwitchInput } from "/imports/ui/components/Form"
import { useFormContext, useWatch } from "react-hook-form"

import MemberSearchInput from "./MemberSearchInput"
import SelectableOrgCards from "../Kiosk/Topups/SelectableOrgCards"

const Pledges = observer(() => {
	const { reset } = useFormContext()
	const watch = useWatch()

	const { topOrgs } = useOrgs()

	const [formStatus, setFormStatus] = useState(STATUS.DISABLED)

	useEffect(() => {
		if(formStatus === STATUS.DISABLED && watch.member !== "" && watch.amount !== "" && watch.id !== "") {
			setFormStatus(STATUS.READY)
		} else if(formStatus === STATUS.READY && (watch.member === "" || watch.amount === "" || watch.id === "")) {
			setFormStatus(STATUS.DISABLED)
		}
	}, [watch])

	return (
		<Grid container spacing={ 2 }>

			<Grid item xs={ 12 }>
				<Stack direction="row" justifyContent="space-between" alignItems="space-between">
					<SwitchInput
						toggle
						label="Anonymous"
						name="anonymous"
					/>
					<Button onClick={ () => reset() }>Clear</Button>
				</Stack>
			</Grid>

			<Grid item xs={ 12 } md={ 8 }>
				<MemberSearchInput required />
			</Grid>

			<Grid item xs={ 12 } md={ 4 }>
				<TextInput
					name="amount"
					placeholder="Pledge Amount"
					required
					pattern="[0-9]*"
					onChange={ value => value.replace(/[^0-9]*/, "") }
					InputProps={ {
						startAdornment: <InputAdornment position="start">$</InputAdornment>,
					} }
				/>
			</Grid>

			<Grid item xs={ 12 }>
				{ /* Selectable Cards for top orgs */ }
				<SelectableOrgCards orgs={ topOrgs } />
			</Grid>

			<Grid item xs={ 12 }>
				<FinalizeButton
					fullWidth
					type="submit"
					status={ formStatus }
					setStatus={ setFormStatus }
					icon={ false }
				>Submit Matched Pledge</FinalizeButton>
			</Grid>

		</Grid>
	)
})

const FinalizeButton = styled(SubmitButton)(({ theme }) => ({
	textAalign: "center",
	border: "2px solid #fff",
	fontSize:" 2rem",
	textTransform: "uppercase",
	"&.Mui-disabled": {
		backgroundColor: theme.palette.batteryGreen.dark,
	},
}))

export default Pledges
