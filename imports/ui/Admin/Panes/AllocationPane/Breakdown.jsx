import React from 'react'

import numeral from 'numeral'

import { observer } from 'mobx-react-lite'
import { useTheme, useOrgs } from '/imports/api/providers'

import styled from '@emotion/styled'
import {
	Paper,
	Stack,
} from '@mui/material'
import { Loading } from '/imports/ui/Components'

const Breakdown = observer(() => {
	const { theme, isLoading: themeLoading } = useTheme()
	const { topOrgs, isLoading: orgsLoading } = useOrgs()

	if(themeLoading || orgsLoading ) return <Loading />

	const saves = theme.saves.reduce((sum, save) => {return sum + save.amount}, 0)
	const topOff = topOrgs.reduce((sum, org) => { return sum + org.topOff }, 0)

	// Values in order of appearance
	const totalPot = theme.leverageTotal + saves
	/* theme.consolationTotal */
	const fundsAllocated = theme.votedFunds + saves + topOff
	const leverage = theme.leverageTotal - theme.consolationTotal - theme.votedFunds - topOff
	/* theme.pledgeTotal */
	/* theme.leverageRemaining */


	return (
		<Paper sx={ { p: 2 } }>
			<Stack direction="row" justifyContent="space-between" alignItems="center">

				{/* Total amount to allocate */}
				<Segment>
					<Value>{ numeral(totalPot).format('$0,0') }</Value>
					<Label>Total Pot + Saves</Label>
				</Segment>

				<Arithmetic>-</Arithmetic>

				{/* Subtract 10k for each unchosen organization */}
				<Segment>
					<Value>{ numeral(theme.consolationTotal).format('$0,0') }</Value>
					<Label>Pulled/Others</Label>
				</Segment>

				<Arithmetic>-</Arithmetic>

				{/* Subtract funds from votes and topOff */}
				<Segment>
					<Value>{ numeral(fundsAllocated).format('$0,0') }</Value>
					<Label>Votes + Topoff + Saves</Label>
				</Segment>

				<Arithmetic>=</Arithmetic>

				{/* Leverage amount to begin pledge round */}
				<Segment>
					<Value>{ numeral(leverage).format('$0,0') }</Value>
					<Label>Starting Leverage</Label>
				</Segment>

				<Arithmetic>-</Arithmetic>

				{/* Subtract funds from pledge round */}
				<Segment>
					<Value>{ numeral(theme.pledgedTotal).format('$0,0') }</Value>
					<Label>Pledge Matches</Label>
				</Segment>

				<Arithmetic>=</Arithmetic>

				{/* Amount remaining to spread to winners */}
				<Segment>
					<Value>{ numeral(theme.leverageRemaining).format('$0,0') }</Value>
					<Label>Remaining</Label>
				</Segment>

			</Stack>
		</Paper>
	)

})

const Segment = styled.div`
	text-align: center;
`

const Value = styled.div`
	font-size: 2rem;
	font-weight: 700;
`

const Label = styled.div`
	font-size: 1.2rem;
`

const Arithmetic = styled.span`
	font-size: 2rem;
`

Breakdown.propTypes = {}

export default Breakdown
