import { type OrgData } from "/imports/api/db"
import styled from "@emotion/styled"
import _ from "lodash"
import { useCallback, useLayoutEffect, useState } from "react"

import FundsSlider from "./FundsSlider"
import { useVoting } from "../VotingContext"
import ManualInput from "./ManualInput"

interface VotingCardContentProps {
	org: OrgData
}

const VotingCardContent = ({ org }: VotingCardContentProps) => {
	const { member, allocations, updateAllocations } = useVoting()
	const [ value, setValue ] = useState(allocations[org._id] || 0)

	useLayoutEffect(() => {
		document.oncontextmenu = () => false

		return () => {
			document.oncontextmenu = null
		}
	}, [])

	const theme = member.theme
	const maxAmount = theme?.amount ?? 0
	const sliderDisabled = maxAmount <= 0

	const applyAllocation = useCallback((newValue: number) => {
		if(newValue < 0 || newValue > maxAmount) {
			return
		}

		if(_.isNaN(newValue)) {
			setValue(0)
			updateAllocations(org._id, 0)
			return
		}

		const parsedValue = Number.parseInt(String(newValue), 10)
		let total = 0
		_.forEach(allocations, (allocationAmount, allocationOrgId) => {
			total += allocationOrgId === org._id ? parsedValue : allocationAmount
		})

		const constrained = maxAmount - total < 0 ? parsedValue + (maxAmount - total) : parsedValue

		setValue(constrained)
		updateAllocations(org._id, constrained)
	}, [allocations, maxAmount, org._id, updateAllocations])

	if(!theme) {
		return null
	}

	return (
		<FundsInputContainer>
			<ManualInput value={ value } onChange={ applyAllocation } />
			<FundsSlider
				value={ value }
				onChange={ applyAllocation }
				maxAmount={ maxAmount }
				isDisabled={ sliderDisabled }
			/>
		</FundsInputContainer>
	)
}

export default VotingCardContent

const FundsInputContainer = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin: 1rem 0 0.25rem 0;
`
