import styled from "@emotion/styled"
import { Box, Grid } from "@mui/material"
import { useMemo, useState, useEffect } from "react"
import { useTheme } from "/imports/api/hooks"
import { useStaticOrgs } from "/imports/api/hooks/static"
import { STATUS, SubmitButton, type Status } from "/imports/ui/components"
import { useFormContext, useWatch } from "react-hook-form"

import { MemberSearchInput } from "./MemberSearchInput"
import { PledgeFormFields } from "../Kiosk/Pledges/PledgeFormFields"

export const PledgesForm = () => {
	const { reset } = useFormContext()
	const watch = useWatch()

	const { orgs, topOrgs } = useStaticOrgs()
	const { theme } = useTheme()

	const remainingOrgs = useMemo(() => {
		const topOrgIds = new Set(topOrgs.map(org => org._id))
		return orgs.filter(org => !topOrgIds.has(org._id))
	}, [orgs, topOrgs])

	const topOrgIds = useMemo(() => new Set(topOrgs.map(org => org._id)), [topOrgs])

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

	if(!theme) return null

	return (
		<Grid container spacing={ 2 }>
			<Grid size={ { xs: 12 } }>
				<PledgeFormFields
					pledgeType="standard"
					topOrgs={ topOrgs }
					remainingOrgs={ remainingOrgs }
					theme={ theme }
					topOrgIds={ topOrgIds }
					memberSearch={ <MemberSearchInput /> }
					onClear={ () => reset() }
				/>
			</Grid>

			<Grid size={ { xs: 12 } } sx={ { display: "flex", justifyContent: "center" } }>
				<SubmitColumn>
					<FinalizeButton
						fullWidth
						type="submit"
						status={ formStatus }
						setStatus={ setFormStatus }
						icon={ false }
					>
						Submit Matched Pledge
					</FinalizeButton>
				</SubmitColumn>
			</Grid>
		</Grid>
	)
}

const SubmitColumn = styled(Box)`
	width: 100%;
	max-width: 28rem;
`

const FinalizeButton = styled(SubmitButton)`
	text-align: center;
	border: 2px solid #fff;
	font-size: 2rem;
	text-transform: uppercase;
`
