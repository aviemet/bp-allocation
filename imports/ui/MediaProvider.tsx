import { createMedia } from "@artsy/fresnel"
import React, { useState, useEffect } from "react"

import { screen as breakpoints } from "./theme"


// Hook for window size
interface WindowSize {
	width: number | undefined
	height: number | undefined
}

export const useWindowSize = () => {
	// Initialize state with undefined width/height so server and client renders match
	// Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
	const [windowSize, setWindowSize] = useState<WindowSize>({
		width: undefined,
		height: undefined,
	})

	useEffect(() => {
		// Handler to call on window resize
		function handleResize() {
			// Set window width/height to state
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		}

		// Add event listener
		window.addEventListener("resize", handleResize)

		// Call handler right away so state gets updated with initial window size
		handleResize()

		// Remove event listener on cleanup
		return () => window.removeEventListener("resize", handleResize)
	}, []) // Empty array ensures that effect is only run on mount

	return windowSize
}

const AppMedia = createMedia({
	breakpoints: breakpoints,
})

// Fresnel context definition
const { MediaContextProvider } = AppMedia

export const mediaStyle = AppMedia.createMediaStyle()
export const { Media } = AppMedia

interface MediaProviderProps {
	children: React.ReactNode
}

const MediaProvider = ({ children }: MediaProviderProps) => {

	return (
		<>
			<style>{ mediaStyle }</style>
			<MediaContextProvider>{ children }</MediaContextProvider>
		</>
	)
}


export default MediaProvider
