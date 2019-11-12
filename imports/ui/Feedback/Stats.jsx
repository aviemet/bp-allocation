import React from 'react';
import _ from 'lodash';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import ExportCsvButton from '/imports/ui/Components/ExportCsvButton';

const Stats = observer(props => {
	const { orgs, members } = useData();

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
					});

					return newMember;

				}) }
				description='Member Information'
			/>
		</React.Fragment>
	);
});

export default Stats;
