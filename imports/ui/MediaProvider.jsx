import React from 'react'
import PropTypes from 'prop-types'
import { createMedia } from '@artsy/fresnel'
import theme from './theme'

const AppMedia = createMedia({
	breakpoints: theme.screen
})

const { MediaContextProvider } = AppMedia

export const mediaStyle = AppMedia.createMediaStyle()
export const { Media } = AppMedia

const MediaProvider = ({ children }) => (
	<>
		<style>{ mediaStyle }</style>
		<MediaContextProvider>{ children }</MediaContextProvider>
	</>
)

MediaProvider.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
}

export default MediaProvider
