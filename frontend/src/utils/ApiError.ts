
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
};

export const TICKET_ERROR_MESSAGES: Record<string, string> = {
    UNAUTHORIZED: "You must be logged in to work with tickets",
    FORBIDDEN: "You don't have enough permissions",
    NOT_FOUND: "Ticket not found",
    VALIDATION_ERROR: "Please check ticket data",
    SERVER_ERROR: "Server error while working with tickets",
    NETWORK_ERROR: "Network error. Please check your connection",
    UNKNOWN: "Something went wrong while working with tickets",
};

export const INCIDENT_ERROR_MESSAGES: Record<string, string> = {
    UNAUTHORIZED: "You must be logged in to work with incident",
    FORBIDDEN: "You don't have enough permissions",
    NOT_FOUND: "IncidentDetails not found",
    VALIDATION_ERROR: "Please check incident data",
    SERVER_ERROR: "Server error while working with incident",
    NETWORK_ERROR: "Network error. Please check your connection",
    UNKNOWN: "Something went wrong while working with incidents",
};

export const AUDIT_ERROR_MESSAGES: Record<string, string> = {
    AUDIT_FORBIDDEN: "You are not allowed to view audit logs",
    INVALID_DATE_RANGE: "Invalid date range selected",
    INVALID_PAGE: "Invalid page number",
    AUDIT_NOT_AVAILABLE: "Audit service is unavailable",
    DB_TIMEOUT: "Audit database timeout",
    UNKNOWN: "Failed to load audit logs",
};
