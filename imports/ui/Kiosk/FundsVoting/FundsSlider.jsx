import React from 'react';
import _ from 'lodash';
import numeral from 'numeral';

import { roundFloat } from '/imports/utils';

import { MemberMethods } from '/imports/api/methods';
import { useVoting } from '/imports/ui/Kiosk/VotingContext';

import styled from 'styled-components';
import InputRange from 'react-input-range';
import { Form, Input, Button, Icon } from 'semantic-ui-react';

const SliderContainer = styled.div`
	width: 100%;
	height: 100%;
	margin: 0;
	position: relative;

	.input-range {
		margin-bottom: 15px;
	}
`;

const Amount = styled.div`
	font-size: 4rem;
	text-align: center;
	line-height: 1.15;
`;

const AmountInputContainer = styled.div`
	/*height: 148px;*/

	&& .ui.input {
		height: 64px;
		text-align: center;
		font-size: 2.5rem;
	}
`;

const BottomAlign = styled.div`
	margin: 15px 5px -15px 5px;
`;

class FundsSliderComponent extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			value: parseInt(props.votes[props.org._id]),
			showLabel: false,
			showInput: false
		}
	}

	componentDidRender = () => {
		document.oncontextmenu = () => {
		  return false;
		}
	}

	handleChange = value => {
		if(_.isNaN(value)) {
			this.setState({value: ''});
			this.props.updateVotes(this.props.org._id, 0);
			return;
		}

		const MAX = this.props.member.theme.amount;

		let sum = 0;
		_.forEach(this.props.votes,(voteAmount, key) => {
			sum += key === this.props.org._id ? parseInt(value) : voteAmount;
		});
		const newValue = MAX - sum < 0 ? parseInt(value) + (MAX - sum) : parseInt(value)

		this.setState({
			value: newValue
		});
		this.props.updateVotes(this.props.org._id, newValue);

	}

	showLabel = () => {
		this.setState({ showLabel: true });
		// Hopefully fix issue where onChangeComplete doesn't fire
		window.addEventListener('mouseup', () => this.setState({ showLabel: false }), {once: true});
		window.addEventListener('touchend', () => this.setState({ showLabel: false }), {once: true});
	}

	showInput = () => {
		this.setState({ showInput: true });
		// Wait a tic for the click/touch event to stop propagating
		setTimeout(() => {
			window.addEventListener('click', this.handlePageClick, false);
			window.addEventListener('touchstart', this.handlePageClick, false);
		}, 1);
	}

	handlePageClick = e => {
		const inputContainer = document.getElementById("inputContainer");
		const clickInsideInput = inputContainer.contains(e.target);

		if(inputContainer && !clickInsideInput) {
			this.hideInput();
		}
	}

	hideInput = () => {
		this.handleChange(_.isNaN(this.state.value) ? 0 : this.state.value);
		this.setState({ showInput: false });
		window.removeEventListener('click', this.handlePageClick, false);
		window.removeEventListener('touchstart', this.handlePageClick, false);
	}

	render() {
		const MAX = this.props.member.theme.amount;
		const showLabelClass = this.state.showLabel ? 'visible' : false;
		console.log({value: this.state.value});
		return (
			<SliderContainer>
				{this.state.showInput ?
					<AmountInputContainer id="inputContainer">
						<Input fluid
							type="number"
							value={this.state.value || ''}
							onChange={e => this.handleChange(parseInt(e.currentTarget.value))}
							size="massive"
							icon="dollar"
							iconPosition="left"
							action={<Button onClick={this.hideInput}><Icon name="check" /></Button>}
						/>
					</AmountInputContainer>
					:
					<Amount onClick={this.showInput}>
						{numeral(this.state.value).format('$0,0')}
					</Amount>
				}
				<BottomAlign className={showLabelClass}>
					<InputRange
						minValue={0}
						maxValue={this.props.member.theme.amount}
						value={this.state.value || 0}
						onChange={this.handleChange}
						onChangeStart={this.showLabel}
						onChangeComplete={() => this.setState({ showLabel: false })}
						formatLabel={value => numeral(value / MAX).format('0%')}
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
