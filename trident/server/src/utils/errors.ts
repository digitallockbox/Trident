export function apiError(message: string, code: string, status = 400) {
    return { message, code, status };
}

export class ApiError extends Error {
    code: string;
    status: number;
    constructor(message: string, code: string, status = 400) {
        super(message);
        this.code = code;
        this.status = status;
    }
}
