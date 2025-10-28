type SortOrder = "asc" | "desc";

type Comparator<T> = (a: T, b: T) => number;

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

export function getComparator<T>(order: SortOrder, orderBy: keyof T): Comparator<T> {
	return order === "desc"
		? (a: T, b: T) => descendingComparator(a, b, orderBy)
		: (a: T, b: T) => -descendingComparator(a, b, orderBy);
}

export function stableSort<T>(array: T[], comparator: Comparator<T>): T[] {
	const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) {
			return order;
		}
		return a[1] - b[1];
	});
	return stabilizedThis.map((el) => el[0]);
}
