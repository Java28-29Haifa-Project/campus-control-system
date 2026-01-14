import {request} from "./client.ts";

export function healthApi() {
    return request("/health", {
        method: "GET"
    });
}