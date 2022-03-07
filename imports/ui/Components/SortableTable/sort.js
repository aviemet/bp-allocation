function descendingComparator(a, b, orderBy) {
	let orderByA = a
	let orderByB = b

	// Allow for nested objects to be sorted
	const orderBySplit = orderBy.split('.')
	orderBySplit.forEach(value => {
		orderByA = orderByA[value]
		orderByB = orderByB[value]
	})

	if (orderByA < orderByB) {
		return 1
	}
	if (orderByA > orderByB) {
		return -1
	}
	return 0
}

export function getComparator(order, orderBy) {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy)
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
export function stableSort(array, comparator) {
	const stabilizedThis = array.map((el, index) => [el, index])
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0])
		if (order !== 0) {
			return order
		}
		return a[1] - b[1]
	})
	return stabilizedThis.map((el) => el[0])
}
