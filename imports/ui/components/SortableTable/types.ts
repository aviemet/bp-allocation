import React from "react"

export interface HeadCell {
	id: string
	label: React.ReactNode
	sort?: boolean
	disablePadding?: boolean
	align?: "left" | "right" | "center"
	span?: number
	width?: string | number
}

export interface TableHeadTopRowCell {
	label: string
	span: number
}

export interface SortableRow {
	_id: string
	[key: string]: unknown
}

