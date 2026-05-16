/** Small helpers for numbers we show on screens after the org transform. */

/**
 * Total funded so far from the org row: allocated dollars plus leverage spread dollars.
 */
export const fundedTotal = (allocatedFunds: number, leverageFunds: number): number =>
	allocatedFunds + leverageFunds

/**
 * For the presentation graph: transformer `need` minus leverage already applied step by step.
 */
export const residualNeed = (need: number, leverageFunds?: number): number =>
	need - (leverageFunds ?? 0)
