const hashString = (value: string) => {
	let hash = 0
	for(let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index)
		hash |= 0
	}
	return hash >>> 0
}

export const shuffleWithSeed = <T>(items: T[], seed: string) => {
	const result = items.slice()
	let state = hashString(seed) || 1
	const next = () => {
		state ^= state << 13
		state ^= state >>> 17
		state ^= state << 5
		state |= 0
		return (state >>> 0) / 4294967296
	}
	for(let index = result.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(next() * (index + 1))
		const temp = result[index]
		result[index] = result[randomIndex]
		result[randomIndex] = temp
	}
	return result
}
