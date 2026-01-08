import ApiError from "../utils/ApiError.ts";


const baseurl = import.meta.env.VITE_API_BASE_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    credentials?: RequestCredentials;
}

export const request= async (path:string, options: RequestOptions = {}): Promise<any> => {
    let response:Response;
    try{
        response = await fetch((`${baseurl}` + path), {
        //response = await fetch((path), {
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
            throw new ApiError("Unauthorized", 401,"UNAUTHORIZED")
        }
        if(response.status >= 500){
            throw new ApiError("Server Error", response.status,"SERVER_ERROR");
        }
        if(!response.ok){
            throw new ApiError("Request failed", response.status,"UNKNOWN");
        }

        return await response.json();
    } catch(e){
        if(e instanceof ApiError){
            throw  e;
        }
        throw new ApiError("Backend is unavailable", 0, "BACKEND_UNAVAILABLE");
    }


}