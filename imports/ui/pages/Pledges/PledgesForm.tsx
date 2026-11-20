import styled from "@emotion/styled"
import { Box, Grid } from "@mui/material"
import { useMemo, useState, useEffect } from "react"
import { useTheme } from "/imports/api/hooks"
import { type OrgDataWithComputed } from "/imports/api/hooks/useOrgs"
import { OrganizationMethods } from "/imports/api/methods"
import { consoleLog } from "/imports/lib/logging"
import { Form, STATUS, SubmitButton, type Status } from "/imports/ui/components"
import { useFormContext, useWatch } from "react-hook-form"

import { MemberSearchInput } from "./MemberSearchInput"
import { PledgeFormFields } from "../Kiosk/Pledges/PledgeFormFields"

interface PledgesFormProps {
	topOrgs: OrgDataWithComputed[]
	remainingOrgs: OrgDataWithComputed[]
}

export const PledgesForm = ({ topOrgs, remainingOrgs }: PledgesFormProps) => {
	const [formStatus, setFormStatus] = useState<Status>(STATUS.DISABLED)

	const handleSubmit = async (data: Record<string, unknown>, { reset }: { reset: () => void }) => {
		setFormStatus(STATUS.SUBMITTING)
		try {
			const res = await OrganizationMethods.pledge.callAsync({
				id: String(data.id || ""),
				amount: Number(data.amount || 0),
				member: String(data.member || ""),
				anonymous: Boolean(data.anonymous),
			})
			if(res) {
				reset()
				setFormStatus(STATUS.DISABLED)
			} else {
				setFormStatus(STATUS.ERROR)
			}
		} catch (err) {
			consoleLog.error(err)
			setFormStatus(STATUS.ERROR)
		}
	}

	return (
		<Form
			defaultValues={ {
				id: "",
				amount: "",
				member: "",
				anonymous: false,
			} }
			onValidSubmit={ handleSubmit }
		>
			<PledgesFormFields
				topOrgs={ topOrgs }
				remainingOrgs={ remainingOrgs }
				formStatus={ formStatus }
				setFormStatus={ setFormStatus }
			/>
		</Form>
	)
}

interface PledgesFormFieldsProps {
	topOrgs: OrgDataWithComputed[]
	remainingOrgs: OrgDataWithComputed[]
	formStatus: Status
	setFormStatus: (status: Status) => void
}

const PledgesFormFields = ({
	topOrgs,
	remainingOrgs,
	formStatus,
	setFormStatus,
}: PledgesFormFieldsProps) => {
	const { reset } = useFormContext()
	const watch = useWatch()
	const { theme } = useTheme()

	const topOrgIds = useMemo(() => new Set(topOrgs.map(org => org._id)), [topOrgs])

	useEffect(() => {
		if(formStatus === STATUS.SUBMITTING || formStatus === STATUS.SUCCESS || formStatus === STATUS.ERROR) {
			return
		}

		const fieldsComplete = watch.member !== "" && watch.amount !== "" && watch.id !== ""
		const nextStatus = fieldsComplete ? STATUS.READY : STATUS.DISABLED
		if(formStatus !== nextStatus) {
			setFormStatus(nextStatus)
		}
	}, [watch, formStatus, setFormStatus])

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
