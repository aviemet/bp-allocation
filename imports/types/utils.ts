import { ReactNode } from "react";

// Utility types
export type ChildrenType = ReactNode | ReactNode[];

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
}

export interface ValidationError {
	field: string;
	message: string;
}

export interface FormState<T = any> {
	data: T;
	errors: ValidationError[];
	isSubmitting: boolean;
	isValid: boolean;
}
