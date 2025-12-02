import styled from "@emotion/styled"
import { Button, Grid, InputAdornment, Stack, Typography } from "@mui/material"
import { useState, useEffect, useMemo } from "react"
import { useOrgs, useTheme } from "/imports/api/hooks"
import { TextInput, SubmitButton, STATUS, SwitchInput, type Status } from "/imports/ui/components/Form"
import { useFormContext, useWatch } from "react-hook-form"

import MemberSearchInput from "./MemberSearchInput"
import SelectableOrgCards from "../Kiosk/Topups/SelectableOrgCards"

const Pledges = () => {
	const { reset } = useFormContext()
	const watch = useWatch()

	const { orgs, topOrgs } = useOrgs()
	const { theme } = useTheme()

	const remainingOrgs = useMemo(() => {
		const topOrgIds = new Set(topOrgs.map(org => org._id))
		return orgs.filter(org => !topOrgIds.has(org._id))
	}, [orgs, topOrgs])

	const [formStatus, setFormStatus] = useState<Status>(STATUS.DISABLED)

	useEffect(() => {
		if(formStatus === STATUS.DISABLED && watch.member !== "" && watch.amount !== "" && watch.id !== "") {
			setTimeout(() => {
				setFormStatus(STATUS.READY)
			}, 0)
		} else if(formStatus === STATUS.READY && (watch.member === "" || watch.amount === "" || watch.id === "")) {
			setTimeout(() => {
				setFormStatus(STATUS.DISABLED)
			}, 0)
		}
	}, [watch, formStatus])

	return (
		<Grid container spacing={ 2 }>

			<Grid size={ { xs: 12 } }>
				<Stack direction="row" justifyContent="space-between" alignItems="space-between">
					<SwitchInput
						label="Anonymous"
						name="anonymous"
					/>
					<Button onClick={ () => reset() }>Clear</Button>
				</Stack>
			</Grid>

			<Grid size={ { xs: 12, md: 8 } }>
				<MemberSearchInput />
			</Grid>

			<Grid size={ { xs: 12, md: 4 } }>
				<TextInput
					name="amount"
					placeholder="Pledge Amount"
					required
					pattern="[0-9]*"
					onChange={ value => value.replace(/[^0-9]*/, "") }
					slotProps={ {
						input: {
							startAdornment: <InputAdornment position="start">$</InputAdornment>,
						},
					} }
				/>
			</Grid>

			<Grid size={ { xs: 12 } }>
				<Typography component="h2" variant="h4" sx={ { textAlign: "center" } }>
					Finalists
				</Typography>
			</Grid>
			<Grid size={ { xs: 12 } }>
				<SelectableOrgCards orgs={ topOrgs } />
			</Grid>

			{ remainingOrgs.length > 0 && theme?.allowRunnersUpPledges && (
				<>
					<Grid size={ { xs: 12 } }>
						<Typography component="h2" variant="h4" sx={ { textAlign: "center" } }>
							Runners Up
						</Typography>
					</Grid>
					<Grid size={ { xs: 12 } }>
						<SelectableOrgCards orgs={ remainingOrgs } />
					</Grid>
				</>
			) }

			<Grid size={ { xs: 12 } }>
				<FinalizeButton
					fullWidth
					type="submit"
					status={ formStatus }
					setStatus={ setFormStatus }
					icon={ false }
				>
					Submit Matched Pledge
				</FinalizeButton>
			</Grid>

		</Grid>
	)
}

const FinalizeButton = styled(SubmitButton)`
	text-align: center;
	border: 2px solid #fff;
	font-size: 2rem;
	text-transform: uppercase;
`

export default Pledges
