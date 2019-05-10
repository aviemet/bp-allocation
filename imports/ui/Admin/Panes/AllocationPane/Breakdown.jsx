import Meter from 'meteor/meteor';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom'
import _ from 'lodash';

import numeral from 'numeral';

import { ThemeContext, OrganizationContext, PresentationSettingsContext } from '/imports/context';

import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods';

import { Loader, Grid, Table, Checkbox, Button, Statistic, Segment, Header } from 'semantic-ui-react';
import styled from 'styled-components';

import AllocationInputs from './AllocationInputs';

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

const Breakdown = props => {

	const { theme } = useContext(ThemeContext);
	const { topOrgs } = useContext(OrganizationContext);

	const saves = theme.saves.reduce((sum, save) => {return sum + save.amount}, 0);
	const totalPot = theme.leverageTotal + saves;
	const leverage = theme.leverageTotal - theme.votedFunds - theme.consolationTotal;

	return (
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
					<Statistic.Value>{numeral(theme.votedFunds + saves).format('$0,0')}</Statistic.Value>
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
	);

}

export default Breakdown;
