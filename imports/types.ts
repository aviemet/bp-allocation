import { ReactNode } from "react"
import "./types/collection2"

export interface BaseEntity {
	_id: string
	createdAt: Date
	updatedAt: Date
}


export interface Organization extends BaseEntity {
	name: string
	description?: string
	isActive: boolean
}

export interface Theme extends BaseEntity {
	name: string
	description?: string
	color: string
	isActive: boolean
}

export interface Message extends BaseEntity {
	title: string
	content: string
	type: "info" | "warning" | "error" | "success"
	isActive: boolean
}

export interface Image extends BaseEntity {
	filename: string
	originalName: string
	size: number
	type: string
	url: string
	isActive: boolean
}

export interface PresentationSettings extends BaseEntity {
	title: string
	subtitle?: string
	logoUrl?: string
	themeId: string
	isActive: boolean
}

export interface MemberTheme extends BaseEntity {
	memberId: string
	themeId: string
	isActive: boolean
}

export type ChildrenType = ReactNode | ReactNode[]

export interface ApiResponse<T = any> {
	success: boolean
	data?: T
	error?: string
	message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	total: number
	page: number
	limit: number
	hasMore: boolean
}

export interface ValidationError {
	field: string
	message: string
}

export interface FormState<T = any> {
	data: T
	errors: ValidationError[]
	isSubmitting: boolean
	isValid: boolean
}
