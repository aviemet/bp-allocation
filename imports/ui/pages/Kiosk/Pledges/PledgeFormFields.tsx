import styled from "@emotion/styled"
import { Box, Button, Grid, InputAdornment, Typography } from "@mui/material"
import numeral from "numeral"
import React, { useEffect, useMemo, useState } from "react"
import { useFormContext, useFormState, useWatch } from "react-hook-form"

import { type OrgDataWithComputed } from "/imports/api/hooks/useOrgs"
import {
	adjustPledgeEntry,
	isOrgEligibleForLeverage,
	maxPledgeFromNeed,
	type PledgeMatchingTheme,
} from "/imports/lib/allocation/pledgeMatching"
import { NumberInput, SwitchInput } from "/imports/ui/components"

import { SelectableOrgCards } from "./SelectableOrgCards"

interface PledgeFormFieldsProps {
	pledgeType: "standard" | "inPerson"
	topOrgs: OrgDataWithComputed[]
	remainingOrgs: OrgDataWithComputed[]
	theme: PledgeMatchingTheme & { leverageRemaining?: number, allowRunnersUpPledges?: boolean }
	topOrgIds: Set<string>
	memberSearch?: React.ReactNode
	onClear?: () => void
}

export const PledgeFormFields = ({
	pledgeType,
	topOrgs,
	remainingOrgs,
	theme,
	topOrgIds,
	memberSearch,
	onClear,
}: PledgeFormFieldsProps) => {
	const { setValue } = useFormContext()
	const { isSubmitSuccessful } = useFormState()
	const selectedOrgId = useWatch({ name: "id" })
	const amountValue = useWatch({ name: "amount" })
	const [showAmountHint, setShowAmountHint] = useState(false)

	const selectedOrg = useMemo(() => {
		if(!selectedOrgId) return undefined

		return [...topOrgs, ...remainingOrgs].find(org => org._id === selectedOrgId)
	}, [selectedOrgId, topOrgs, remainingOrgs])

	const matchMultiplier = pledgeType === "inPerson"
		? (theme.inPersonMatchRatio ?? 0)
		: (theme.matchRatio ?? 0)

	const matchEligible = !!selectedOrg && isOrgEligibleForLeverage(selectedOrg._id, theme, topOrgIds)
	const remainingLeverage = theme.leverageRemaining ?? 0
	const maxPledge = selectedOrg
		? maxPledgeFromNeed(selectedOrg.need, matchMultiplier, remainingLeverage, matchEligible)
		: 0

	const evaluation = useMemo(() => {
		if(!selectedOrg || amountValue === "" || amountValue === undefined) return null

		const parsed = Number(amountValue)
		if(Number.isNaN(parsed) || parsed <= 0) return null

		return adjustPledgeEntry(parsed, maxPledge)
	}, [selectedOrg, amountValue, maxPledge])

	const handleClear = () => {
		setValue("id", "")
		setValue("amount", "")
		onClear?.()
	}

	useEffect(() => {
		if(!evaluation || !selectedOrg) return

		// Do nothing if we haven't exceeded a max value
		const current = Number(amountValue)
		if(Number.isNaN(current) || current === evaluation.amount) return

		// Adjust amount and show adjustment explanation
		setTimeout(() => setShowAmountHint(true), 10)
		setValue("amount", String(evaluation.amount), { shouldValidate: true })
	}, [evaluation, amountValue, selectedOrg, setValue])

	useEffect(() => {
		if(!isSubmitSuccessful) return

		setTimeout(() => setShowAmountHint(false), 1)
	}, [isSubmitSuccessful])

	useEffect(() => {
		setTimeout(() => setShowAmountHint(false), 1)
	}, [selectedOrg])

	return (
		<Grid container spacing={ 2 }>

			{ /* Member Name Input */ }
			<Grid size={ { xs: 12, md: 9 } } sx={ { order: { xs: 3, md: 1 } } }>
				<Box sx={ { flex: 1, minWidth: 0 } }>
					{ memberSearch }
				</Box>
			</Grid>

			{ /* Anonymous Toggle */ }
			<Grid
				size={ { xs: 6, md: 2 } }
				sx={ {
					order: { xs: 1, md: 2 },
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				} }
			>
				<SwitchInput label="Anonymous" name="anonymous" />
			</Grid>

			{ /* Clear Button */ }
			<Grid
				size={ { xs: 6, md: 1 } }
				sx={ {
					order: { xs: 2, md: 3 },
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				} }
			>
				<Button type="button" onClick={ handleClear } fullWidth>Clear</Button>
			</Grid>

			<Grid size={ { xs: 12 } } sx={ { order: 10 } }>
				<Typography component="h2" variant="h5" sx={ { textAlign: "center" } }>Finalists</Typography>
			</Grid>

			<Grid size={ { xs: 12 } } sx={ { order: 11 } }>
				<SelectableOrgCards orgs={ topOrgs } />
			</Grid>

			{ remainingOrgs.length > 0 && theme.allowRunnersUpPledges && <>
				<Grid size={ { xs: 12 } } sx={ { order: 12 } }>
					<Typography component="h2" variant="h5" sx={ { textAlign: "center", mt: 2 } }>Runners Up</Typography>
				</Grid>

				<Grid size={ { xs: 12 } } sx={ { order: 13 } }>
					<SelectableOrgCards orgs={ remainingOrgs } />
				</Grid>
			</> }

			<Grid
				size={ { xs: 12 } }
				sx={ {
					order: 20,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				} }
			>
				<AmountColumn>
					{ showAmountHint && selectedOrg && (
						<NeedHint>
							{ selectedOrg.title } needs { numeral(selectedOrg.need).format("$0,0") } more to reach their ask of { numeral(selectedOrg.ask).format("$0,0") }.
							{ maxPledge < selectedOrg.need && matchMultiplier > 1 && (
								<> You can pledge up to { numeral(maxPledge).format("$0,0") } with full matching.</>
							) }
						</NeedHint>
					) }
					<NumberInput
						name="amount"
						placeholder="Pledge Amount"
						required
						slotProps={ {
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<Typography sx={ { fontFamily: "Roboto" } }>$</Typography>
									</InputAdornment>
								),
							},
							htmlInput: {
								sx: {
									padding: "0.5rem",
									textAlign: "center",
								},
							},
						} }
					/>
				</AmountColumn>
			</Grid>
		</Grid>
	)
}

const AmountColumn = styled(Box)`
	width: 100%;
	max-width: 28rem;
`

const NeedHint = styled.p`
	text-align: center;
	font-size: 1rem;
	margin: 0 0 0.5rem 0;
`

