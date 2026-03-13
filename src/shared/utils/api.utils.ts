import { ApiResponse } from "../types/api.types";

// Utils para respuestas exitosas
export const APISuccessResponse = <T>(
    data: T, 
    message: string, 
    metadata?: Record<string, any>
): ApiResponse<T> => {
    return {
        success: true,
        message,
        data,
        metadata,
        errors: null
    };
};

// Utils para respuestas de error
export const APIErrorResponse = <T>(
    message: string, 
    errors?: string[]
): ApiResponse<T> => {
    return { 
        success: false, 
        message, 
        errors: errors || []
    };
};