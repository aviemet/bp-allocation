import { createRoute } from "@tanstack/react-router"

import PledgesRoute from "../PledgesRoute"
import { rootRoute } from "../rootRoute"

export const pledgesRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/pledges/$id",
	component: PledgesRoute,
})

