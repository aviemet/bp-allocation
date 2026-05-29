import styled from "@emotion/styled"
import { Box, Button, Grid, InputAdornment, Typography } from "@mui/material"
import React, { useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import { type OrgDataWithComputed } from "/imports/api/hooks/useOrgs"
import {
	isOrgEligibleForLeverage,
	previewMatchedPrincipal,
	type PledgeMatchingTheme,
} from "/imports/lib/allocation/pledgeMatching"
import { NumberInput, SwitchInput } from "/imports/ui/components"

import { PledgeMatchHintMessage } from "./PledgeMatchHintMessage"
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
	const selectedOrgId = useWatch({ name: "id" })
	const amountValue = useWatch({ name: "amount" })

	const selectedOrg = useMemo(() => {
		if(!selectedOrgId) return undefined

		return [...topOrgs, ...remainingOrgs].find(org => org._id === selectedOrgId)
	}, [selectedOrgId, topOrgs, remainingOrgs])

	const matchMultiplier = pledgeType === "inPerson"
		? (theme.inPersonMatchRatio ?? 0)
		: (theme.matchRatio ?? 0)

	const matchEligible = !!selectedOrg && isOrgEligibleForLeverage(selectedOrg._id, theme, topOrgIds)
	const remainingLeverage = theme.leverageRemaining ?? 0

	const matchPreview = useMemo(() => {
		if(!selectedOrg || amountValue === "" || amountValue === undefined) return null

		const parsed = Number(amountValue)
		if(Number.isNaN(parsed) || parsed <= 0) return null

		return previewMatchedPrincipal({
			pledgeAmount: parsed,
			orgNeed: selectedOrg.need,
			matchMultiplier,
			remainingLeverage,
			matchEligible,
		})
	}, [selectedOrg, amountValue, matchMultiplier, remainingLeverage, matchEligible])

	const handleClear = () => {
		setValue("id", "")
		setValue("amount", "")
		onClear?.()
	}

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
					{ matchPreview && selectedOrg && amountValue !== "" && amountValue !== undefined && (
						<PledgeMatchHintMessage
							orgTitle={ selectedOrg.title ?? "" }
							pledgeAmount={ Number(amountValue) }
							orgNeed={ selectedOrg.need }
							preview={ matchPreview }
						/>
					) }

				</AmountColumn>
			</Grid>
		</Grid>
	)
}

const AmountColumn = styled(Box)`
	width: 100%;
	max-width: 28rem;
`
