import React from 'react';
import { Button } from 'semantic-ui-react';
import { ThemeMethods } from '/imports/api/methods';
import { useData } from '/imports/api/stores/lib/DataProvider';

const ResetOrgFundsButton = () => {
	const { theme } = useData();

	const resetOrgFunds = () => {
		ThemeMethods.resetAllOrgFunds.call(theme._id);
	};

	return (
		<Button onClick={ resetOrgFunds }>Reset Funds for All Orgs</Button>
	);
};

export default ResetOrgFundsButton;