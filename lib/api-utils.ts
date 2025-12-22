import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

type ApiResponse<T = any> = {
    success: boolean
    data?: T
    error?: string
    details?: any
}

export function apiResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400, details?: any): NextResponse<ApiResponse> {
    return NextResponse.json({ success: false, error: message, details }, { status })
}

export function handleApiError(error: unknown) {
    console.error('[API Error]', error)

    if (error instanceof ZodError) {
        return apiError('Validation Error', 400, error.errors)
    }

    if (error instanceof Error) {
        return apiError(error.message, 500)
    }

    return apiError('Internal Server Error', 500)
}
