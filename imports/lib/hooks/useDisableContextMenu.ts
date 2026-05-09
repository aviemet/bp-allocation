import { useLayoutEffect } from "react"

export const useDisableContextMenu = () => {
	useLayoutEffect(() => {
		document.oncontextmenu = () => false

		return () => {
			document.oncontextmenu = () => null
		}
	}, [])
}
