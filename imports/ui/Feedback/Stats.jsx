import React from 'react';
import _ from 'lodash';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/api/stores/lib/DataProvider';

import { PieChart, Pie, Sector, Cell } from 'recharts';

import ExportCsvButton from '/imports/ui/Components/ExportCsvButton';

import { toJS } from 'mobx';

const Stats = observer(props => {
	const { orgs, members } = useData();

	console.log({ member: toJS(members.values[0]) });
	console.log({ org: toJS(orgs.values[0]) });

	const data = [
		{ name: 'Group A', value: 400 }, { name: 'Group B', value: 300 },
		{ name: 'Group C', value: 300 }, { name: 'Group D', value: 200 }
	];
	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

	/**
	 * pledge = { org, memberName, memberNumber, amount, createdAt }
	 */
	const pledges = [];
	orgs.topOrgs.forEach(org => {
		org.pledges.forEach(pledge => {
			const member = members.values.find(member => member._id === pledge.member);
			const pledgeData = { 
				Organization: org.title, 
				'Member Name': member.fullName, 
				'Member Number': member.number, 
				Amount: pledge.amount, 
				'Time Stamp': pledge.createdAt
			};
			pledges.push(pledgeData);
		});
	});

	return (
		<React.Fragment>
			<ExportCsvButton
				data={ members.values.map(member => {
					let newMember = {
						'Name': member.fullName,
						'Code': member.code,
						'Initials': member.initials,
						'Number': member.number
					};

					orgs.topOrgs.forEach(org => {
						const allocation = _.find(member.theme.allocations, ['organization', org._id]);
						newMember[org.title] = allocation ? allocation.amount : 0;
						newMember['Source'] = allocation ? allocation.voteSource : '';
					});

					return newMember;

				}) }
				description='Member Information'
			/>

			<ExportCsvButton
				data={ pledges }
				description='Topup Pledges'
			/>

			<PieChart width={ 800 } height={ 400 }>
				<Pie data={ data }>
					{ data.map((entry, index) => <Cell key={ index } fill={ COLORS[index % COLORS.length] } />) }
				</Pie>
			</PieChart>

		</React.Fragment>
	);
});

export default Stats;
