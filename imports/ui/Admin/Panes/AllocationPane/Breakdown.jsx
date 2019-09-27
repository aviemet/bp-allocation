import React from 'react';

import numeral from 'numeral';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { Statistic, Segment } from 'semantic-ui-react';
import styled from 'styled-components';

const Arithmetic = styled.span`
	font-size: 2rem;
	display: inline-flex;
  flex: 0 1 auto;
  flex-direction: column;
  font-family: 'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif;
  font-weight: normal;
  line-height: 1em;
  color: #1b1c1d;
  text-align: center;
`;

const BreakdownContainer = styled.div`
	& .ui.statistics .ui.statistic {
		margin: 0em 1em 2em;
	}
`;

const Breakdown = observer(() => {
	const data = useData();
	const { theme } = data;

	const saves = theme.saves.reduce((sum, save) => {return sum + save.amount;}, 0);
	const topOff = data.orgs.topOrgs.reduce((sum, org) => { return sum + org.topOff; }, 0);

	// Values in order of appearance
	const totalPot = theme.leverageTotal + saves;
	/* theme.consolationTotal */
	const fundsAllocated = theme.votedFunds + saves + topOff;
	const leverage = theme.leverageTotal - theme.consolationTotal - theme.votedFunds - topOff;
	/* theme.pledgeTotal */
	/* theme.leverageRemaining */


	return (
		<BreakdownContainer>
			<Segment>
				<Statistic.Group size='tiny'>

					{/* Total amount to allocate */}
					<Statistic>
						<Statistic.Value>{numeral(totalPot).format('$0,0')}</Statistic.Value>
						<Statistic.Label>Total Pot + Saves</Statistic.Label>
					</Statistic>

					<Arithmetic>-</Arithmetic>

					{/* Subtract 10k for each unchosen organization */}
					<Statistic>
						<Statistic.Value>{numeral(theme.consolationTotal).format('$0,0')}</Statistic.Value>
						<Statistic.Label>Pulled/Others</Statistic.Label>
					</Statistic>

					<Arithmetic>-</Arithmetic>

					{/* Subtract funds from votes and topOff */}
					<Statistic>
						<Statistic.Value>{numeral(fundsAllocated).format('$0,0')}</Statistic.Value>
						<Statistic.Label>Votes + Topoff + Saves</Statistic.Label>
					</Statistic>

					<Arithmetic>=</Arithmetic>

					{/* Leverage amount to begin pledge round */}
					<Statistic>
						<Statistic.Value>{numeral(leverage).format('$0,0')}</Statistic.Value>
						<Statistic.Label>Starting Leverage</Statistic.Label>
					</Statistic>

					<Arithmetic>-</Arithmetic>

					{/* Subtract funds from pledge round */}
					<Statistic>
						<Statistic.Value>{numeral(theme.pledgedTotal).format('$0,0')}</Statistic.Value>
						<Statistic.Label>Pledge Matches</Statistic.Label>
					</Statistic>

					<Arithmetic>=</Arithmetic>

					{/* Amount remaining to spread to winners */}
					<Statistic>
						<Statistic.Value>{numeral(theme.leverageRemaining).format('$0,0')}</Statistic.Value>
						<Statistic.Label>Remaining</Statistic.Label>
					</Statistic>

				</Statistic.Group>
			</Segment>
		</BreakdownContainer>
	);

});

Breakdown.propTypes = {};

export default Breakdown;
