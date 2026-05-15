import styled from "@emotion/styled"
import { Box, Container, InputAdornment, Typography } from "@mui/material"
import { isEmpty } from "es-toolkit/compat"
import { useState } from "react"

import { type MemberWithTheme } from "/imports/api/db"
import { OrganizationMethods } from "/imports/api/methods"
import { consoleLog } from "/imports/lib/logging"
import {
	Form,
	Loading,
	OrgCardColors,
	PledgeComplete,
	STATUS,
	SubmitButton,
	SwitchInput,
	TextInput,
	type Status,
} from "/imports/ui/components"
import { useKioskVoting } from "../KioskVotingContext"
import { SelectableOrgCards } from "./SelectableOrgCards"

interface PledgesProps {
	user: MemberWithTheme
}

export const Pledges = ({ user }: PledgesProps) => {
	const { topOrgs, orgsLoading } = useKioskVoting()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)

	const [ pledgeFeedbackData, setPledgeFeedbackData ] = useState<Record<string, unknown>>({})

	const handleSubmit = async (data: Record<string, unknown>, { reset }: { reset: () => void }) => {
		try {
			const res = await OrganizationMethods.pledge.callAsync({
				id: String(data.id || ""),
				amount: Number(data.amount || 0),
				member: user._id,
				anonymous: Boolean(data.anonymous),
			})
			if(res) {
				reset()
				setPledgeFeedbackData(data)
			}
		} catch (err) {
			consoleLog.error(err)
		}
	}

	if(orgsLoading) return <Loading />
	if(!isEmpty(pledgeFeedbackData)) {
		const org = topOrgs.find(org => org._id === pledgeFeedbackData.id)
		if(!org) return <Loading />
		return <PledgeComplete data={ { amount: Number(pledgeFeedbackData.amount || 0), org } } resetData={ () => setPledgeFeedbackData({}) } matchKind="standard" />
	}
	return (
		<PledgesContainer>
			<h1>If you feel like giving more</h1>
			<p>Pledges made during this round will be matched from the leverage remaining. If you feel strongly about an organization and want to help them achieve full funding, now is your chance!</p>

			<Form
				defaultValues={ {
					id: "",
					amount: "",
					anonymous: false,
				} }
				onValidSubmit={ handleSubmit }
			>
				<Container>
					<Box sx={ { textAlign: "right", marginBottom: "0.5rem" } }>
						<SwitchInput
							label="Anonymous"
							name="anonymous"
						/>
					</Box>
					<TextInput
						name="amount"
						placeholder="Pledge Amount"
						required
						sx={ { mb: 2 } }
						slotProps={ {
							input: {
								startAdornment: (
									<InputAdornment position="start" sx={ { margin: 0 } }>
										<Typography sx={ { fontFamily: "Roboto", margin: "0 !important" } }>$</Typography>
									</InputAdornment>
								),
							},
							htmlInput: {
								sx: {
									padding: "0.5rem",
									textAlign: "center",
								},
								inputMode: "numeric",
								pattern: "[0-9.]*",
							},
						} }
					/>

					<Box sx={ { mb: 2 } }>
						<SelectableOrgCards orgs={ topOrgs } />
					</Box>

					<FinalizeButton
						type="submit"
						status={ formStatus }
						setStatus={ setFormStatus }
					>
						Submit Matched Pledge
					</FinalizeButton>
				</Container>
			</Form>

		</PledgesContainer>
	)
}

const PledgesContainer = styled(Container)`
	h1 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
	}
`

const FinalizeButton = styled(SubmitButton)`
	width: 100%;
	text-align: center;
	background-color: ${OrgCardColors.GREEN};
	color: white;
	border: 2px solid #fff;
	font-size: clamp(1.75rem, -3rem + 3vw + 4.5vh, 3rem);
	text-transform: uppercase;
`

