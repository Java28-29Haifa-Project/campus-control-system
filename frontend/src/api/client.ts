import ApiError from "../utils/ApiError.ts";
import {getApiBaseUrl} from "../utils/getBaseUrl.ts";

const baseurl = getApiBaseUrl();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    credentials?: RequestCredentials;
}

export const request= async <T>(path:string, options: RequestOptions = {}): Promise<T> => {

    let response:Response;
    try{
        response = await fetch((`${baseurl}` + path), {
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