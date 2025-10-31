import { useRef, useEffect } from "react"

/*****************
 * DEBUG METHODS *
 *****************/

/**
* Hook to console.log prop changes in a useEffect block
* @param props Props object to trace
*/
export const useTraceUpdate = <T extends Record<string, unknown>>(props: T): void => {
	const prev = useRef<T>(props)
	useEffect(() => {
		const changedProps = Object.entries(props).reduce((ps: Record<string, [unknown, unknown]>, [k, v]) => {
			if(prev.current[k] !== v) {
				ps[k] = [prev.current[k], v]
			}
			return ps
		}, {})
		if(Object.keys(changedProps).length > 0) {
			// eslint-disable-next-line no-console
			console.log("Changed props:", changedProps)
		}
		prev.current = props
	})
}
