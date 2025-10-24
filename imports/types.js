import { shape, node, func, number, string, oneOf, oneOfType, arrayOf } from "prop-types"

export const childrenType = oneOfType([
	arrayOf(node),
	node,
])
