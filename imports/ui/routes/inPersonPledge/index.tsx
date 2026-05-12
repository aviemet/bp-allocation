import { createRoute } from "@tanstack/react-router"

import { InPersonPledgeRoute } from "../InPersonPledgeRoute"
import { rootRoute } from "../rootRoute"

export const inPersonPledgeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/pledges/inperson/$themeId",
	component: InPersonPledgeRoute,
})
