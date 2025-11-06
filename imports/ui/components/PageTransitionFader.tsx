import styled from "@emotion/styled"
import React, { useEffect, useRef, useState, startTransition } from "react"

const FADE_DURATION = 300

const PageFader = styled.div<{ visible: boolean }>`
	opacity: ${props => props.visible ? 1 : 0};
	transition: opacity ${FADE_DURATION}ms ease-in-out;
	width: 100%;
`

interface PageTransitionFaderProps {
	currentPage: string
	children: (page: string) => React.ReactNode
	id?: string
}

const PageTransitionFader = ({ currentPage, children, id }: PageTransitionFaderProps) => {
	const [displayedPage, setDisplayedPage] = useState<string | undefined>(() => currentPage)
	const [show, setShow] = useState(true)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
	const isTransitioningRef = useRef(false)
	const pendingPageRef = useRef<string | undefined>(undefined)

	useEffect(() => {
		if(displayedPage === undefined) {
			return
		}

		if(displayedPage !== currentPage) {
			pendingPageRef.current = currentPage

			if(timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = undefined
			}

			if(isTransitioningRef.current) {
				startTransition(() => {
					setDisplayedPage(currentPage)
				})
			} else {
				startTransition(() => {
					setShow(false)
				})
				isTransitioningRef.current = true
			}

			timeoutRef.current = setTimeout(() => {
				const finalPage = pendingPageRef.current
				if(finalPage) {
					setDisplayedPage(finalPage)
				}
				setShow(true)
				isTransitioningRef.current = false
				pendingPageRef.current = undefined
				timeoutRef.current = undefined
			}, FADE_DURATION)

			return () => {
				if(timeoutRef.current) {
					clearTimeout(timeoutRef.current)
					timeoutRef.current = undefined
				}
			}
		} else if(isTransitioningRef.current && !timeoutRef.current) {
			timeoutRef.current = setTimeout(() => {
				setShow(true)
				isTransitioningRef.current = false
				timeoutRef.current = undefined
			}, FADE_DURATION)
		}
	}, [currentPage, displayedPage])

	if(!displayedPage) return null

	return (
		<PageFader visible={ show } id={ id }>
			{ children(displayedPage) }
		</PageFader>
	)
}

export default PageTransitionFader

