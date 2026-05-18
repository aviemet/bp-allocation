import { roundFloat } from "/imports/lib/utils"

/**
 * While the leverage spread is running: how much is left to reach `ask`, after baseline allocation and leverage added so far. Rounded.
 */
export const needDuringSpread = (
	ask: number,
	allocatedFunds: number,
	leverageFunds: number,
): number =>
	roundFloat(String((ask || 0) - (allocatedFunds || 0) - (leverageFunds || 0)))
