import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import numeral from 'numeral';

import { roundFloat } from '/imports/utils';

import { MemberMethods } from '/imports/api/methods';

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

const FundsSlider = props => {

	console.log({props});

	const MAX_AMOUNT = props.member.theme.amount;
/*
	let initialValue = 0;
	if(!_.isUndefined(props)) {
		initialValue = roundFloat(_.find(props.member.theme.allocations, ['organization', props.org._id]).amount);
	}
	if(props.onChangeCallback) {
		props.onChangeCallback(props.org._id, initialValue);
	}

	const [ value, setValue ] = useState(initialValue);

	// console.log({value});
	// console.log({props});

	// Updats MemberTheme.allocations.push({org, amount})
	const handleChange = value => {
		// console.log({newValue: value});
		setValue(value);
	}

	useEffect(() => {
		if(props.onChangeCallback) {
			props.onChangeCallback(props.org._id, value);
		}
	});
*/
	// MemberMethods.fundVote.call({theme: props.theme._id, member: props.member._id, org: props.org._id, amount: value});

	const handleChange = value => {
		if(props.onChangeCallback) {
			props.onChangeCallback({value, orgId: props.org._id});
		}
	}

  return (
  	<SliderContainer>
  		<Amount>{numeral(props.vote).format('$0,0')}</Amount>
  		<BottomAlign>
		    <InputRange
					minValue={0}
					maxValue={MAX_AMOUNT}
					value={props.vote}
					onChange={handleChange}
					formatLabel={value => ''}
					step={5}
				/>
			</BottomAlign>
		</SliderContainer>
  )
}

export default FundsSlider;
