import { createRoute } from "@tanstack/react-router"

import KioskRoute from "../KioskRoute"
import { rootRoute } from "../rootRoute"

export const kioskRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/kiosk/$id",
	component: KioskRoute,
})

