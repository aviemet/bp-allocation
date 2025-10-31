import { useMediaQuery } from "@mui/material"
import React, { useState, useEffect, ReactNode } from "react"

import { screen as breakpoints } from "./theme"

export { breakpoints }

interface WindowSize {
	width: number | undefined
	height: number | undefined
}

export const useWindowSize = () => {
	const [windowSize, setWindowSize] = useState<WindowSize>({
		width: undefined,
		height: undefined,
	})

	useEffect(() => {
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		}

		window.addEventListener("resize", handleResize)
		handleResize()

		return () => window.removeEventListener("resize", handleResize)
	}, [])

	return windowSize
}

interface MediaProps {
	at?: keyof typeof breakpoints
	lessThan?: keyof typeof breakpoints
	greaterThan?: keyof typeof breakpoints
	between?: [keyof typeof breakpoints, keyof typeof breakpoints]
	children?: ReactNode
}

export const Media = ({ at, lessThan, greaterThan, between, children }: MediaProps) => {
	const getQuery = (): string => {
		if(at) {
			const minWidth = breakpoints[at]
			const sortedBreakpoints = Object.values(breakpoints).sort((a, b) => a - b)
			const currentIndex = sortedBreakpoints.indexOf(minWidth)
			const nextBreakpoint = sortedBreakpoints[currentIndex + 1]

			if(nextBreakpoint) {
				return `(min-width: ${minWidth}px) and (max-width: ${nextBreakpoint - 1}px)`
			}
			return `(min-width: ${minWidth}px)`
		}

		if(lessThan) {
			const maxWidth = breakpoints[lessThan]
			return `(max-width: ${maxWidth - 1}px)`
		}

		if(greaterThan) {
			const minWidth = breakpoints[greaterThan]
			return `(min-width: ${minWidth + 1}px)`
		}

		if(between) {
			const [min, max] = between
			return `(min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`
		}

		return "(min-width: 0px)"
	}

	const query = getQuery()
	const matches = useMediaQuery(query)

	if(!matches) {
		return null
	}

	return <>{ children }</>
}

export const mediaStyle = ""

interface MediaProviderProps {
	children: ReactNode
}

const MediaProvider = ({ children }: MediaProviderProps) => {
	return <>{ children }</>
}

export default MediaProvider
