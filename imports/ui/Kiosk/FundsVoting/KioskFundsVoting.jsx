import React, { useState, useReducer } from 'react';
import numeral from 'numeral';
import _ from 'lodash';

import { Loader, Card, Container, Header, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import { useTheme, useOrganizations, usePresentationSettings, useImages } from '/imports/context';

import OrgCard from '/imports/ui/Components/OrgCard';
import FundsSlider from './FundsSlider';

const OrgsContainer = styled(Container)`
	padding-top: 20px;

	.ui.card {
		margin: 2rem 1rem;

		.content{
			color: #002B45;
			padding-bottom: 0.2em;
		}
	}

	.title {
		color: #FFF;
		text-align: center;
		font-size: 3rem;
		text-transform: uppercase;
	}

	p {
		line-height: 1em;
	}
`;

const sliderReducer = (state, action) => {

}

const AmountRemaining = React.memo(function AmountRemaining({value}) {
	return <Header as='h1' className="title">FUNDS LEFT TO ALLOCATE: {numeral(value).format('$0,0')}</Header>
});

const KioskInfo = props => {

	const [ allocated, setAllocated ] = useState(props.member.theme.allocations.reduce((sum, allocation) => { return allocation.amount + sum; }, 0));


	const { theme, themeLoading } = useTheme();
	const { topOrgs, orgsLoading } = useOrganizations();
	const { images } = useImages();
	const { settings } = usePresentationSettings();

	const [ state, dispatch ] = useReducer(sliderReducer, []);

	let sliderValues = {};
	topOrgs.map(org => {
		sliderValues[org._id] = 0;
	});

	const updateAllocation = (org, amount) => {
		sliderValues[org] = amount;
		let total = 0;
		_.forOwn(sliderValues, value => { total += value});
		// setAllocated(total);

		console.log({total});
	}

	const finalizeVotes = () => {
		console.log({sliderValues});
	}

	if(themeLoading || orgsLoading ) {
		return <Loader />
	}

	return (
		<OrgsContainer>
			<Header as='h1' className="title">Voting for {props.member.firstName}</Header>
			<Card.Group centered itemsPerRow={2}>
				{topOrgs.map(org => (
					<OrgCard
						key={org._id}
						org={org}
						// image={_.find(images, ['_id', org.image])}
						overlay={() => (
							<FundsSlider
								theme={theme}
								member={props.member}
								org={org}
								onChangeCallback={updateAllocation}
							/>
						)}
					/>
				))}
			</Card.Group>
			<AmountRemaining value={props.member.theme.amount - allocated} />
			<Button size='huge' onClick={finalizeVotes}>Finalize Vote</Button>
		</OrgsContainer>
	);
}

export default KioskInfo
