import { createRoute } from "@tanstack/react-router"

import PledgesOverlayRoute from "../PledgesOverlayRoute"
import { rootRoute } from "../rootRoute"

export const pledgesOverlayRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/pledges-overlay/$id",
	component: PledgesOverlayRoute,
})
