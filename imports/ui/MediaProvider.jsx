import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { createMedia } from '@artsy/fresnel'
import theme from './theme'

export const { screen: breakpoints } = theme

// Hook for window size
export const useWindowSize = () => {
	// Initialize state with undefined width/height so server and client renders match
	// Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
	const [windowSize, setWindowSize] = useState({
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
		window.addEventListener('resize', handleResize)

		// Call handler right away so state gets updated with initial window size
		handleResize()

		// Remove event listener on cleanup
		return () => window.removeEventListener('resize', handleResize)
	}, []) // Empty array ensures that effect is only run on mount

	return windowSize
}

const AppMedia = createMedia({
	breakpoints: theme.screen
})

// Fresnel context definition
const { MediaContextProvider } = AppMedia

export const mediaStyle = AppMedia.createMediaStyle()
export const { Media } = AppMedia

const MediaProvider = ({ children }) => {

	return (
		<>
			<style>{ mediaStyle }</style>
			<MediaContextProvider>{ children }</MediaContextProvider>
		</>
	)
}

MediaProvider.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
}

export default MediaProvider
