import React from 'react';
import { isEmpty } from 'lodash';

import { observer } from 'mobx-react-lite';
import { useOrgs, useMembers } from '/imports/api/providers';

import { PieChart, Pie, Cell } from 'recharts';

import ExportCsvButton from '/imports/ui/Components/ExportCsvButton';
import { Loader } from 'semantic-ui-react';

const Stats = observer(props => {
	const { orgs, topOrgs, isLoading: orgsLoading } = useOrgs();
	const { members, isLoading: membersLoading } = useMembers();

	if(orgsLoading || membersLoading || isEmpty(members)) return <Loader active />;

	const data = [
		{ name: 'Group A', value: 400 }, { name: 'Group B', value: 300 },
		{ name: 'Group C', value: 300 }, { name: 'Group D', value: 200 }
	];
	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

	/**
	 * pledge = { org, memberName, memberNumber, amount, createdAt }
	 */
	console.log({ topOrgs });
	const pledges = [];
	topOrgs.forEach(org => {
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

					topOrgs.forEach(org => {
						const allocation = member.theme.allocations.find(allocation => allocation.organization === org._id);
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
				<Pie data={ data } label>
					{ data.map((entry, index) => <Cell key={ index } fill={ COLORS[index % COLORS.length] } />) }
				</Pie>
			</PieChart>

		</React.Fragment>
	);
});

export default Stats;
