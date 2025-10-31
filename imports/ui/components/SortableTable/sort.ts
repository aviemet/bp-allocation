import { SortableRow } from "./types"

type SortOrder = "asc" | "desc"

function descendingComparator<T extends SortableRow>(a: T, b: T, orderBy: string): number {
	let orderByA: unknown = a
	let orderByB: unknown = b

	const orderBySplit = orderBy.split(".")
	orderBySplit.forEach(value => {
		if(orderByA && typeof orderByA === "object" && value in orderByA) {
			orderByA = (orderByA as Record<string, unknown>)[value]
		}
		if(orderByB && typeof orderByB === "object" && value in orderByB) {
			orderByB = (orderByB as Record<string, unknown>)[value]
		}
	})

	if(orderByA === null || orderByA === undefined) {
		if(orderByB === null || orderByB === undefined) return 0
		return 1
	}
	if(orderByB === null || orderByB === undefined) return -1

	if(orderByA < orderByB) {
		return 1
	}
	if(orderByA > orderByB) {
		return -1
	}
	return 0
}

export function getComparator<T extends SortableRow>(
	order: SortOrder,
	orderBy: string
): (a: T, b: T) => number {
	return order === "desc"
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy)
}

export function stableSort<T extends SortableRow>(
	array: T[],
	comparator: (a: T, b: T) => number
): T[] {
	const stabilizedThis = array.map((el, index) => [el, index] as const)
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0])
		if(order !== 0) {
			return order
		}
		return a[1] - b[1]
	})
	return stabilizedThis.map((el) => el[0])
}
