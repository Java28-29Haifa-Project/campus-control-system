export function getApiBaseUrl() {
    const vite = (import.meta)?.env?.VITE_API_BASE_URL;

    const node = (process)?.env?.VITE_API_BASE_URL;

    return vite || node || "http://localhost:8080";
}