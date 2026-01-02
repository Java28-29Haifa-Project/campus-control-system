import confJson from "../../config/lib-config.json" with {type:'json'}

export type AppConfig = {
    port: number
}
export const config:AppConfig = {
    ...confJson
}
