import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import numeral from 'numeral';

import { roundFloat } from '/imports/utils';

import { MemberMethods } from '/imports/api/methods';
import { useVoting } from '/imports/ui/Kiosk/VotingContext';

import styled from 'styled-components';
import InputRange from 'react-input-range';

const SliderContainer = styled.div`
	width: 100%;
	height: 100%;
	background: rgba(0,0,0,0.5);
	margin: 0;
	padding: 15px;
	position: relative;

	.input-range {
		margin-bottom: 15px;
	}
`;

const Amount = styled.div`
	font-size: 5.75rem;
	text-align: center;
	line-height: 1.15;
	margin-top: 2rem;
`;

const BottomAlign = styled.div`
	position: absolute;
	bottom: 0;
	width: 100%;
	padding-right: 30px;
`;

class FundsSliderComponent extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			value: props.votes[props.org._id]
		}
	}

	componentWillUnmount() {
		console.log("unmounting");
	}

	handleChange = value => {
		this.setState({
			value: value
		});
		this.props.onUpdate(this.props.org._id, value);
	}

	render() {
		return (
			<SliderContainer>
				<Amount>{numeral(this.state.value).format('$0,0')}</Amount>
				<BottomAlign>
					<InputRange
						minValue={0}
						maxValue={this.props.member.theme.amount}
						value={this.state.value}
						onChange={this.handleChange}
						formatLabel={value => ''}
						step={5}
					/>
				</BottomAlign>
			</SliderContainer>
		)
	}
}


const FundsSlider = props => {
	const { member, votes, updateVotes } = useVoting();

	const context = Object.assign({ member, votes, updateVotes }, props);

	return <FundsSliderComponent {...context}>{props.children}</FundsSliderComponent>;
}

export default FundsSlider;
