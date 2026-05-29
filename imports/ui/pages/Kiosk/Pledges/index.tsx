import styled from "@emotion/styled"
import { Box, Container } from "@mui/material"
import { isEmpty } from "es-toolkit/compat"
import { useMemo, useState } from "react"

import { type MemberWithTheme } from "/imports/api/db"
import { usePledgeFormOrgs, useTheme } from "/imports/api/hooks"
import { OrganizationMethods } from "/imports/api/methods"
import { consoleLog } from "/imports/lib/logging"
import {
	Form,
	Loading,
	OrgCardColors,
	PledgeComplete,
	STATUS,
	SubmitButton,
	type Status,
} from "/imports/ui/components"
import { isOrgEligibleForLeverage } from "/imports/lib/allocation/pledgeMatching"

import { useKioskVoting } from "../KioskVotingContext"
import { PledgeFormFields } from "./PledgeFormFields"

interface PledgesProps {
	user: MemberWithTheme
}

export const Pledges = ({ user }: PledgesProps) => {
	const { topOrgs: staticTopOrgs, orgsLoading } = useKioskVoting()
	const { topOrgs } = usePledgeFormOrgs(staticTopOrgs)
	const { theme, themeLoading } = useTheme()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)
	const [pledgeFeedbackData, setPledgeFeedbackData] = useState<Record<string, unknown>>({})

	const topOrgIds = useMemo(() => new Set(topOrgs.map(org => org._id)), [topOrgs])

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

	if(orgsLoading || themeLoading || !theme) return <Loading />

	if(!isEmpty(pledgeFeedbackData)) {
		const orgId = String(pledgeFeedbackData.id || "")
		const org = topOrgs.find(row => row._id === orgId)

		if(!org) return <Loading />

		return (
			<PledgeComplete
				data={ {
					amount: Number(pledgeFeedbackData.amount || 0),
					org,
					matchEligible: isOrgEligibleForLeverage(org._id, theme, topOrgIds),
				} }
				resetData={ () => setPledgeFeedbackData({}) }
				matchKind="standard"
			/>
		)
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
					<PledgeFormFields
						pledgeType="standard"
						topOrgs={ topOrgs }
						remainingOrgs={ [] }
						theme={ theme }
						topOrgIds={ topOrgIds }
					/>

					<SubmitRow>
						<SubmitColumn>
							<FinalizeButton
								type="submit"
								status={ formStatus }
								setStatus={ setFormStatus }
							>
								Submit Pledge
							</FinalizeButton>
						</SubmitColumn>
					</SubmitRow>
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
