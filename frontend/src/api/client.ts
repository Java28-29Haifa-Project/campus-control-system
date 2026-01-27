import ApiError from "../utils/ApiError.ts";

const isMockAuth = import.meta.env.VITE_MOCK_AUTH === 'true';
const isSkipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';
const isMockTickets = import.meta.env.VITE_USE_MOCK_TICKETS === 'true';

const baseurl = import.meta.env.VITE_API_BASE_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    credentials?: RequestCredentials;
}

export const request= async <T>(path:string, options: RequestOptions = {}): Promise<T> => {

    //TODO delete mocks
    if (isMockAuth || isSkipAuth || isMockTickets) {
        console.log("[MOCK-API] skipping fetch →", path);
        throw new ApiError("MOCK_MODE: SKIP_FETCH", 0, "MOCK");
    }


    let response:Response;
    try{
        response = await fetch((`${baseurl}` + path), {
        // response = await fetch((path), {
            method: options.method ?? "GET",
            headers: {
                ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
                ...(options.headers ?? {})
            },
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
            signal: options.signal,
            credentials: options.credentials ?? "include"
        });

        if(response.status === 401){
            const msg = await response.text();
            throw new ApiError(msg ||"Unauthorized", 401,"UNAUTHORIZED")
        }
        if(response.status >= 500){
            const msg = await response.text();
            throw new ApiError(msg ||"Server Error", response.status,"SERVER_ERROR");
        }
        if(!response.ok){
            const msg = await response.text();
            throw new ApiError(msg ||"Request failed", response.status,"UNKNOWN");
        }

        return await response.json() as T;
    } catch(e){
        if(e instanceof ApiError){
            throw  e;
        }
        throw new ApiError("Backend is unavailable", 0, "BACKEND_UNAVAILABLE");
    }


}