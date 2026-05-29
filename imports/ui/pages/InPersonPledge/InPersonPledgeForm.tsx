import styled from "@emotion/styled"
import { Box, Button, Container, Stack, Typography } from "@mui/material"
import numeral from "numeral"
import { useMemo, useState } from "react"

import { usePledgeFormOrgs, useTheme } from "/imports/api/hooks"
import { useStaticOrgs } from "/imports/api/hooks/static"
import { OrganizationMethods } from "/imports/api/methods"
import {
	Form,
	Loading,
	OrgCardColors,
	PledgeComplete,
	STATUS,
	SubmitButton,
	type PledgeCompleteData,
	type Status,
} from "/imports/ui/components"
import { type MemberWithTheme } from "/imports/api/db"
import { isOrgEligibleForLeverage } from "/imports/lib/allocation/pledgeMatching"

import { PledgeFormFields } from "/imports/ui/pages/Kiosk/Pledges/PledgeFormFields"

interface InPersonPledgeFormProps {
	user: MemberWithTheme
	onSignOut: () => void
}

export const InPersonPledgeForm = ({ user, onSignOut }: InPersonPledgeFormProps) => {
	const { theme, themeLoading } = useTheme()
	const { topOrgs: staticTopOrgs, orgsLoading } = useStaticOrgs()
	const { topOrgs } = usePledgeFormOrgs(staticTopOrgs)

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)
	const [completed, setCompleted] = useState<PledgeCompleteData | null>(null)
	const [submitError, setSubmitError] = useState<string | null>(null)

	const topOrgIds = useMemo(() => new Set(topOrgs.map(org => org._id)), [topOrgs])

	if(themeLoading || orgsLoading || !theme) return <Loading />

	const remainingLeverage = Number(theme.leverageRemaining || 0)
	const ratio = theme.inPersonMatchRatio ?? 1
	const matchPerDollar = Math.max(0, ratio - 1)

	const handleSubmit = async (data: Record<string, unknown>, { reset }: { reset: () => void }) => {
		setSubmitError(null)
		try {
			const orgId = String(data.id || "")
			const amount = Number(data.amount || 0)
			const org = topOrgs.find(row => row._id === orgId)
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
				setCompleted({
					amount,
					org,
					matchEligible: isOrgEligibleForLeverage(orgId, theme, topOrgIds),
				})
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Could not submit pledge"
			setSubmitError(message)
		}
	}

	if(completed) {
		return (
			<InPersonPledgeCompleteViewport>
				<PledgeComplete
					data={ completed }
					resetData={ () => setCompleted(null) }
					matchKind="inPerson"
				/>
			</InPersonPledgeCompleteViewport>
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
					<PledgeFormFields
						pledgeType="inPerson"
						topOrgs={ topOrgs }
						remainingOrgs={ [] }
						theme={ theme }
						topOrgIds={ topOrgIds }
					/>

					{ submitError && (
						<Typography sx={ { color: WARNING_COLOR, textAlign: "center", mb: 2 } }>{ submitError }</Typography>
					) }

					<SubmitRow>
						<SubmitColumn>
							<FinalizeButton
								type="submit"
								status={ formStatus }
								setStatus={ setFormStatus }
							>
								Submit Matched Pledge
							</FinalizeButton>
						</SubmitColumn>
					</SubmitRow>
				</Container>
			</Form>
		</PledgesContainer>
	)
}

const InPersonPledgeCompleteViewport = styled.div`
	max-width: 100vw;
	min-height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
`

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

const SubmitRow = styled(Box)`
	display: flex;
	justify-content: center;
	margin-top: 1rem;
`

const SubmitColumn = styled(Box)`
	width: 100%;
	max-width: 28rem;
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
