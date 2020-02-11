import React from 'react';
import _ from 'lodash';

import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useData } from '/imports/api/stores/lib/DataProvider';

import ExportCsvButton from '/imports/ui/Components/ExportCsvButton';

const Stats = observer(props => {
	const { orgs, members } = useData();

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
		</React.Fragment>
	);
});

export default Stats;
