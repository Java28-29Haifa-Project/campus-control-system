
class ApiError extends Error {
    status: number;
    code: string;

    constructor(message: string, status: number, code: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
export default ApiError;

export const LOGIN_ERROR_MESSAGES :Record<string, string> = {
    UNAUTHORIZED: "Incorrect email or password",
    SERVER_ERROR: "Server Error",
    UNKNOWN: "Request failed",
}