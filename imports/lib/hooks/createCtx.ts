import React from 'react'

const createContext = <T extends {} | null>() => {
	const ctx = React.createContext<T | undefined>(undefined)

	const useCtx = () => {
		const c = React.useContext(ctx)
		if(c === undefined) {
			throw new Error('useCtx must be inside a Provider with a value')
		}
		return c
	}

	return [useCtx, ctx.Provider] as const
}

export default createContext
