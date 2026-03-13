export type ApiResponse<T> = {
    success: boolean;
    message: string;

    data?: T;
    metadata?: Record<string, any>;
    
    errors?: string[] | null;
};