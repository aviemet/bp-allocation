import { isEmpty } from "lodash"
import { Meteor } from "meteor/meteor"

export const roundFloat = (value: string | number, decimal = 2) => {
	const numberValue = typeof value === "string" ? parseFloat(value) : value
	return parseFloat(numberValue.toFixed(decimal))
}

export const formatters = {
	currency: new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}),
}

export const numberFormats = {
	dollar: "$0,0[a]",
	percent: "0.0%",
}

export function isMobileDevice(): boolean {
	if(typeof window === "undefined" || typeof navigator === "undefined") {
		return false
	}

	return (
		typeof screen.orientation !== "undefined" ||
		navigator.userAgent.indexOf("IEMobile") !== -1
	)
}

export const paginate = <T>(collection: T[], page: number, itemsPerPage: number) => collection.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

// Ensures names are in the format 'First Last'
// Breaks apart names given as 'Last, First' and returns them as 'First Last'
export const sanitizeNames = (name: string) => {
	const split = name.split(",")
	const newName = []
	for(let i = 1; i < split.length; i++) {
		newName.push(split[i].trim())
	}
	newName.push(split[0])

	return newName.join(" ")
}

// Format phone numbers as international numbers
// Assume any number lacking a '+' at beginning is a US number (add +1 to start)
export const formatPhoneNumber = (number: string) => {
	let newPhone = number.replace(/[^0-9+]/g, "") // Reduce number down to numbers and the + symbol

	if(!isEmpty(newPhone) && !/^\+/.test(newPhone)) { // Doesn't start with +
		newPhone = "+1" + newPhone.replace(/^1/, "") // US area codes don't start with 0 or 1
	}

	return newPhone
}

export const sanitizeString = (str: string | number) => `${str}`.trim()

/**
 * Returns a subset of passed collection filtered by search terms
 * @param {array} collection Array of objects to be filtered
 * @param {string} search Search parameter(s) to filter by
 * @param {array} fields Optional list of fields to search (omitting others)
 */
export const filterCollection = <T extends Record<string, unknown> & { readonly _id: string }>(collection: T[], search: string, fields?: (keyof T)[]) => {
	if(!search) return collection

	// Split search terms by whitespace, discarding empty strings
	const searchParts = search.split(/\s+/).filter(part => part.length > 0)
	const checkFields = fields || Object.keys(collection[0])

	return collection.filter(member => {
		return searchParts.every(word => {
			const test = new RegExp(word, "i")
			return checkFields.some(field => {
				const fieldValue = member[field]
				if(typeof fieldValue === "string" && test.test(fieldValue)) {
					return true
				}
			})
		})
	})
}

export const uuid = () => {
	let timestamp = new Date().getTime()
	// Time in microseconds since page-load or 0 if unsupported
	let micro = (performance && performance.now && (performance.now() * 1000)) || 0

	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
		let random = Math.random() * 16 // random number between 0 and 16

		if(timestamp > 0) { // Use timestamp until depleted
			random = (timestamp + random) % 16 | 0
			timestamp = Math.floor(timestamp / 16)
		} else { // Use microseconds since page-load if supported
			random = (micro + random) % 16 | 0
			micro = Math.floor(micro / 16)
		}
		return (c === "x" ? random : (random & 0x3 | 0x8)).toString(16)
	})
}

export const emailVotingLink = (slug: string, code: string) => {
	return `<p style='text-align: center; height: 4rem;'><a style='font-family: Arial, sans-serif; font-size: 2rem; padding: 15px; margin-bottom: 10px; border: 1px solid #CCC; border-radius: 10px; background-color: green; color: white; text-decoration: none;' href='${Meteor.settings.HOST_URL}/v/${slug}/${code}'>Vote Here</a></p>`
}


export const textVotingLink = (slug: string, code: string) => {
	return "\n" + `${Meteor.settings.HOST_URL}/v/${slug}/${code}`
}
