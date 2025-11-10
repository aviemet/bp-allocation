import styled from "@emotion/styled"
import { Slider } from "@mui/material"
import numeral from "numeral"

interface FundsSliderProps {
	maxAmount: number
	isDisabled: boolean
	value: number
	onChange: (amount: number) => void
}

const FundsSlider = ({ value, onChange, maxAmount, isDisabled }: FundsSliderProps) => {
	const handleSliderChange = (_event: Event, newValue: number | number[]) => {
		const numericValue = Array.isArray(newValue) ? newValue[0] : newValue
		onChange(numericValue)
	}

	return (
		<SliderWrapper>
			<StyledSlider
				disabled={ isDisabled }
				min={ 0 }
				max={ maxAmount || 1 }
				value={ value || 0 }
				onChange={ handleSliderChange }
				step={ 5 }
				valueLabelDisplay="auto"
				valueLabelFormat={ (sliderValue) => {
					if(maxAmount <= 0) {
						return "0%"
					}
					return numeral(sliderValue / maxAmount).format("0%")
				} }
			/>
		</SliderWrapper>
	)
}


const SliderWrapper = styled.div`
	position: relative;
	margin-top: 8px;
`

const StyledSlider = styled(Slider)(() => ({
	color: "#FFFFFF",
	"& .MuiSlider-track": {
		backgroundColor: "#FFFFFF",
	},
	"& .MuiSlider-thumb": {
		backgroundColor: "#FFFFFF",
		border: "2px solid rgba(0, 0, 0, 0.3)",
	},
	"& .MuiSlider-valueLabel": {
		left: "auto",
		right: "calc(100% + 12px)",
		top: "50%",
		bottom: "auto",
		transform: "translate(0, -50%) scale(0)",
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		color: "#000",
		borderRadius: 4,
		border: "1px solid rgba(0, 0, 0, 0.2)",
		padding: "2px 8px",
		fontWeight: 600,
		"&:before": {
			display: "none",
		},
	},
	"& .MuiSlider-valueLabel.MuiSlider-valueLabelOpen": {
		transform: "translate(0, -50%) scale(1)",
	},
}))

export default FundsSlider

