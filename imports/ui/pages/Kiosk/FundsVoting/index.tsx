import styled from "@emotion/styled"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { Container, Button, Typography, FormControlLabel, Checkbox, Tooltip } from "@mui/material"
import { forEach } from "es-toolkit/compat"
import numeral from "numeral"
import React, { useState, useEffect, startTransition } from "react"

import { useData } from "/imports/api/providers"
import { useSettings } from "/imports/api/hooks"
import { Countdown } from "../Countdown"
import { useKioskVoting } from "../KioskVotingContext"
import { VotingComplete } from "../VotingComplete"
import { OrgCard, OrgCardContainer } from "/imports/ui/components"
import { VotingCardContent } from "./VotingCardContent"
import { COLORS } from "/imports/lib/global"
import { type MemberWithTheme } from "/imports/api/db"
import { VotingSource } from "/imports/api/methods/MemberMethods"

interface AmountRemainingProps {
	value: number
}

const AmountRemaining = React.memo(({ value }: AmountRemainingProps) => {
	return (
		<h2>
			FUNDS LEFT TO ALLOCATE: <NumberFormat>{ numeral(value).format("$0,0") }</NumberFormat>
		</h2>
	)
})

interface FundsVotingKioskProps {
	user: MemberWithTheme
	source: VotingSource
}

export const FundsVotingKiosk = ({ user, source }: FundsVotingKioskProps) => {
	const data = useData()
	const { settings } = useSettings()
	const { topOrgs, allocations, saveAllocations, member } = useKioskVoting()

	const voted = user.theme?.allocations?.some(org => (org.amount || 0) > 0) || false

	const [ votingComplete, setVotingComplete ] = useState(voted)
	const [ countdownVisible, setCountdownVisible ] = useState(false)
	const [ isCounting, setIsCounting ] = useState(false)
	const [ allowPartial, setAllowPartial ] = useState(false)

	useEffect(() => {
		// Display countdown if user is on voting screen when voting becomes disabled
		if(settings && !settings.fundsVotingActive) {
			const timeoutId = setTimeout(() => {
				setCountdownVisible(true)
				setIsCounting(true)
			}, 0)
			return () => clearTimeout(timeoutId)
		}
		startTransition(() => {
			setCountdownVisible(false)
			setIsCounting(false)
		})
	}, [settings])

	const memberName = user.firstName ? user.firstName : user.fullName

	let allocationsSum = 0
	forEach(allocations, value => allocationsSum += value)
	const remaining = (member.theme?.amount || 0) - allocationsSum
	const buttonDisabled = remaining < 0 || (remaining > 0 && !allowPartial)

	if(votingComplete) {
		return <VotingComplete setVotingComplete={ setVotingComplete } />
	}

	return (
		<OrgsContainer>
			<Typography variant="h3" component="h1" align="center" sx={ { mb: 3 } }>
				{ user.firstName && "Voting for" } { memberName }
			</Typography>

			{ countdownVisible && <Countdown seconds={ data.votingRedirectTimeout } isCounting={ isCounting } /> }

			<OrgCardContainer cols={ 2 } sx={ { mt: 2 } }>
				{ topOrgs.map(org => {
					return (
						<OrgCard
							key={ org._id }
							org={ org }
							showAsk={ false }
							size="small"
							info={ true }
							content={ () => <VotingCardContent org={ org } /> }
						/>
					)
				}) }
			</OrgCardContainer>

			<>
				<AmountRemaining value={ remaining } />
				<PartialVoteRow>
					<PartialVoteToggle
						control={
							<PartialVoteCheckbox
								size="small"
								checked={ allowPartial }
								onChange={ e => setAllowPartial(e.target.checked) }
							/>
						}
						label="Submit without allocating all funds"
					/>
					<Tooltip
						title="Voting partial funds will leave some in the communal balance to be spread among the remaining organizations"
						placement="top"
						arrow
						slotProps={ {
							tooltip: { sx: { backgroundColor: "#616161", color: "#fff", fontSize: "1.25rem", maxWidth: 320, padding: "8px 12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)" } },
							arrow: { sx: { color: "#616161" } },
						} }
					>
						<PartialVoteInfoIcon />
					</Tooltip>
				</PartialVoteRow>
				<FinalizeButton
					disabled={ buttonDisabled }
					onClick={ () => {
						saveAllocations(source)
						setVotingComplete(true)
					} }
				>
					Finalize Vote
				</FinalizeButton>
			</>
		</OrgsContainer>
	)
}

const OrgsContainer = styled(Container)`
	padding-top: 16px;
	padding-bottom: 16px;
	text-align: center;

	&& p {
		line-height: 1em;
	}
`

const FinalizeButton = styled(Button)`
	width: 100%;
	text-align: center;
	color: white;
	border: 2px solid #fff;
	font-size: 2rem;
	text-transform: uppercase;
	background-color: ${COLORS.blue};

	&.Mui-disabled {
		background-color: ${COLORS.blue};
	}
`

const NumberFormat = styled.span`
	width: 12rem;
	display: inline-block;
`

const PartialVoteRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	margin-top: -12px;
	margin-bottom: 24px;
`

const PartialVoteToggle = styled(FormControlLabel)`
	margin: 0;
	color: rgba(255, 255, 255, 0.7);

	.MuiFormControlLabel-label {
		font-size: 0.85rem;
	}
`

const PartialVoteCheckbox = styled(Checkbox)`
	&& .MuiSvgIcon-root {
		color: rgba(255, 255, 255, 0.55);
	}

	&&.Mui-checked .MuiSvgIcon-root {
		color: rgba(255, 255, 255, 0.85);
	}
`

const PartialVoteInfoIcon = styled(InfoOutlinedIcon)`
	cursor: help;
	color: rgba(255, 255, 255, 0.55);
`

