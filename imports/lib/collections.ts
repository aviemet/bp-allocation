export const coerceArray = <T extends unknown>(arg: T | T[] | null | undefined) => {
	if(arg === null || arg === undefined) return []

	if(Array.isArray(arg)) return arg

	return [arg]
}
