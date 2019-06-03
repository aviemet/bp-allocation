import React from 'react';
import { VictoryStack, VictoryArea, VictoryLine, VictoryChart, VictoryTheme } from 'victory';
import numeral from 'numeral';

import { useTheme, useOrganizations, useMembers } from '/imports/context';

import styled from 'styled-components';

import { COLORS } from '/imports/global';

const Stats = (props) => {
	const { theme } = useTheme();
	const { topOrgs } = useOrganizations();
	const { members } = useMembers();

	console.log({theme, topOrgs, members});

	let totals = { a: 0, b: 0, c: 0 };
	let data = [];
	topOrgs.map(org => {
		totals.a += org.amountFromVotes;
		totals.b += org.amountFromVotes + org.pledgeTotal;
		totals.c += org.amountFromVotes + org.pledgeTotal + org.leverageFunds;

		data.push([
			{x: "Round 1 Votes", y: org.amountFromVotes},
			{x: "Pledges", y: org.amountFromVotes + org.pledgeTotal},
			{x: "Leverage Spread", y: org.amountFromVotes + org.pledgeTotal + org.leverageFunds}
		])
	});

	let points = [
		{x: "Round 1 Votes", y: totals.a},
		{x: "Pledges", y: totals.b},
		{x: "Leverage Spread", y: totals.c}
	];

	console.log({points});

	return (
		<React.Fragment>
			<VictoryStack width={600}
				colorScale={"qualitative"}
				animate={{
					duration: 2000,
					onLoad: { duration: 1000 }
				}}
			>
				{data.map((datum, i) => (
					<VictoryArea
						key={i}
						data={datum}
					/>
				))}
			<VictoryChart maxDomain={{y: totals.c}}>
			<VictoryLine data={points}
				labels={d => numeral(d.y).format('$0.[00]a')} />
		</VictoryChart>
			</VictoryStack>
		</React.Fragment>
	)
}

export default Stats;
