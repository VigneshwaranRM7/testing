class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true, stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = JSON.stringify(stack, null, 2);
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;
