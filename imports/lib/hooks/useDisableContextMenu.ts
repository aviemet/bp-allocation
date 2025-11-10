import { useLayoutEffect } from "react"

const useDisableContextMenu = () => {
	useLayoutEffect(() => {
		document.oncontextmenu = () => false

		return () => {
			document.oncontextmenu = () => null
		}
	}, [])
}

export default useDisableContextMenu
