import styled from "@emotion/styled"
import { Container, Button, Typography } from "@mui/material"
import { forEach } from "es-toolkit/compat"
import { useState, useEffect, useMemo, startTransition } from "react"

import { useData } from "/imports/api/providers"
import { useSettings } from "/imports/api/hooks"

import { OrgCardContainer } from "/imports/ui/components"
import { Countdown } from "../Countdown"
import { useKioskVoting } from "../KioskVotingContext"
import { VotingComplete } from "../VotingComplete"
import { COLORS } from "/imports/lib/global"
import { ChitVoteOrgCard } from "./ChitVoteOrgCard"
import { type MemberWithTheme } from "/imports/api/db"
import { VotingSource } from "/imports/api/methods/MemberMethods"
import { shuffleWithSeed } from "/imports/lib/shuffleWithSeed"

interface ChitVotingKioskProps {
	user: MemberWithTheme
	source: VotingSource
}

export const ChitVotingKiosk = ({ user, source }: ChitVotingKioskProps) => {
	const data = useData()
	const { settings } = useSettings()
	const { orgs, chits, saveChits, member } = useKioskVoting()

	const [ votingComplete, setVotingComplete ] = useState(false)
	const [ countdownVisible, setCountdownVisible ] = useState(false)
	const [ isCounting, setIsCounting ] = useState(false)

	useEffect(() => {
		if(settings?.chitVotingActive === false) {
			startTransition(() => {
				setCountdownVisible(true)
				setIsCounting(true)
			})
		} else {
			startTransition(() => {
				setCountdownVisible(false)
				setIsCounting(false)
			})
		}
	}, [settings?.chitVotingActive])

	const handleFinalizeVote = () => {
		saveChits(source)
		setVotingComplete(true)
	}

	const shuffledOrgs = useMemo(() => {
		if(!orgs) return []

		const sorted = orgs.slice().sort((a, b) => a._id.localeCompare(b._id))
		return shuffleWithSeed(sorted, user._id).map(org => <ChitVoteOrgCard key={ org._id } org={ org } />)
	}, [orgs, user._id])

	let chitsSum = 0
	forEach(chits, value => chitsSum += value)
	const remaining = (member.theme?.chits || 0) - chitsSum
	const buttonDisabled = remaining !== 0

	if(votingComplete) {
		return <VotingComplete setVotingComplete={ setVotingComplete } />
	}

	const memberName = user.firstName ? user.firstName : user.fullName

	return (
		<OrgsContainer>

			<Typography variant="h3" component="h1" align="center" sx={ { mb: 3 } }>
				{ user.firstName && "Voting for" } { memberName }
			</Typography>

			{ countdownVisible && <Countdown seconds={ data.votingRedirectTimeout } isCounting={ isCounting } /> }

			<Container maxWidth="xl" sx={ { height: "100%" } }>
				<OrgCardContainer
					cols={ 2 }
					sx={ {
						mt: 2,
						paddingBottom: "clamp(0rem, -58.1818rem + 90.9091vh, 10rem)",
					} }
				>
					{ shuffledOrgs }
				</OrgCardContainer>
			</Container>

			<>
				<h2>ROUND 1 VOTES LEFT: <NumberFormat>{ remaining }</NumberFormat></h2>

				<FinalizeButton
					disabled={ buttonDisabled }
					onClick={ handleFinalizeVote }
				>
					Finalize Vote
				</FinalizeButton>
			</>
		</OrgsContainer>
	)
}

const OrgsContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	padding-top: 16px;
	padding-bottom: 16px;
	height: 100%;

	&& p{
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
	display: inline-block;
`
