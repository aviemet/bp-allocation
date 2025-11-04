import { createRoute } from "@tanstack/react-router"

import PresentationRoute from "../PresentationRoute"
import { rootRoute } from "../rootRoute"

export const presentationRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/presentation/$id",
	component: PresentationRoute,
})

