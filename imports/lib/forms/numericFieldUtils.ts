import { type InputEvent } from "react"

export function filterNumericInput(raw: string, integer: boolean): string {
	let result = ""
	let hasDot = false
	for(const char of raw) {
		if(char >= "0" && char <= "9") {
			result += char
			continue
		}
		if(!integer && char === "." && !hasDot) {
			hasDot = true
			result += char
		}
	}
	return result
}

export function toDisplayString(value: unknown): string {
	if(value === null || value === undefined || value === "") {
		return ""
	}
	return String(value)
}

export function shouldBlockBeforeInput(e: InputEvent<HTMLInputElement>, integer: boolean): boolean {
	const native = e.nativeEvent
	const inputType = native.inputType
	if(!inputType || inputType.startsWith("delete")) {
		return false
	}
	if(
		inputType === "insertFromPaste" ||
		inputType === "insertFromDrop" ||
		inputType === "insertTranspose" ||
		inputType === "historyUndo" ||
		inputType === "historyRedo"
	) {
		return false
	}

	const data = native.data
	if(data === null || data === undefined || data === "") {
		return false
	}

	const target = e.currentTarget
	const value = target.value
	const selectionStart = target.selectionStart ?? value.length
	const selectionEnd = target.selectionEnd ?? selectionStart
	const withoutSelection = value.slice(0, selectionStart) + value.slice(selectionEnd)

	for(const char of data) {
		if(char >= "0" && char <= "9") {
			continue
		}
		if(!integer && char === ".") {
			if(withoutSelection.includes(".")) {
				return true
			}
			continue
		}
		return true
	}
	return false
}
