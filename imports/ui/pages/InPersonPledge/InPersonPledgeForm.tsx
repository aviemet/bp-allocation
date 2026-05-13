import styled from "@emotion/styled"
import { Box, Button, Container, InputAdornment, Stack, Typography } from "@mui/material"
import numeral from "numeral"
import { useState } from "react"

import { useOrgs, useTheme } from "/imports/api/hooks"
import { OrganizationMethods } from "/imports/api/methods"
import {
	Form,
	Loading,
	OrgCardColors,
	STATUS,
	SubmitButton,
	SwitchInput,
	TextInput,
	type Status,
} from "/imports/ui/components"
import { type MemberWithTheme } from "/imports/api/db"

import { SelectableOrgCards } from "/imports/ui/pages/Kiosk/Pledges/SelectableOrgCards"
import { InPersonPledgeComplete, type CompletedPledge } from "./InPersonPledgeComplete"

interface InPersonPledgeFormProps {
	user: MemberWithTheme
	onSignOut: () => void
}

export const InPersonPledgeForm = ({ user, onSignOut }: InPersonPledgeFormProps) => {
	const { theme, themeLoading } = useTheme()
	const { topOrgs, orgsLoading } = useOrgs()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)
	const [completed, setCompleted] = useState<CompletedPledge | null>(null)
	const [submitError, setSubmitError] = useState<string | null>(null)

	if(themeLoading || orgsLoading || !theme) return <Loading />

	const remainingLeverage = Number(theme.leverageRemaining || 0)
	const ratio = theme.inPersonMatchRatio ?? 1
	const matchPerDollar = Math.max(0, ratio - 1)

	const handleSubmit = async (data: Record<string, unknown>, { reset }: { reset: () => void }) => {
		setSubmitError(null)
		try {
			const orgId = String(data.id || "")
			const amount = Number(data.amount || 0)
			const org = topOrgs.find(o => o._id === orgId)
			if(!org) {
				setSubmitError("Please select an organization.")
				return
			}
			const res = await OrganizationMethods.pledge.callAsync({
				id: orgId,
				amount,
				member: user._id,
				anonymous: Boolean(data.anonymous),
				pledgeType: "inPerson",
			})
			if(res) {
				reset()
				setCompleted({ amount, org })
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Could not submit pledge"
			setSubmitError(message)
		}
	}

	if(completed) {
		return (
			<InPersonPledgeComplete
				data={ completed }
				resetData={ () => setCompleted(null) }
				onSignOut={ onSignOut }
			/>
		)
	}

	const formattedRemaining = numeral(remainingLeverage).format("$0,0")
	const poolWarning = remainingLeverage <= 0
		? "The leverage pool is exhausted. Your pledge will still go to the org but will not receive a leverage match."
		: null

	return (
		<PledgesContainer>
			<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "center", mb: 1, color: "white" } }>
				<Typography>Signed in as <b>{ user.firstName } { user.lastName }</b></Typography>
				<Button onClick={ onSignOut } sx={ { color: "white" } }>Sign Out</Button>
			</Stack>
			<h1>In-Person Pledges</h1>
			<RatioCallout>
				Pledges submitted here are matched <b>{ ratio > 0 ? `${matchPerDollar}:1` : "0:1" }</b> from the leverage pot.
			</RatioCallout>
			<PoolStatus>
				Remaining leverage pool: <b>{ formattedRemaining }</b>
				{ poolWarning && <PoolWarning>{ poolWarning }</PoolWarning> }
			</PoolStatus>

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

					{ submitError && (
						<Typography sx={ { color: WARNING_COLOR, textAlign: "center", mb: 2 } }>{ submitError }</Typography>
					) }

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
	color: white;
	width: 100%;

	h1 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}
`

const RatioCallout = styled.p`
	text-align: center;
	font-size: 1.25rem;
	margin: 0 0 1rem 0;
`

const PoolStatus = styled.div`
	text-align: center;
	font-size: 1.1rem;
	margin-bottom: 1rem;
`

const WARNING_COLOR = "#E1333E"

const PoolWarning = styled.div`
	color: ${WARNING_COLOR};
	margin-top: 0.5rem;
	font-style: italic;
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
