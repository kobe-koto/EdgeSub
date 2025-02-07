export const getDefaultHeader = (url: URL) => { 
    return {
        "Access-Control-Allow-Origin": getAllowedOriginHeader(url),
        "content-type": "application/json, charset=utf-8",
        "Access-Control-Allow-Credentials": "true",
    } as unknown as Headers;
}
export const getDefaultOptionsHeader = (url: URL) => { 
    return {
        //"Access-Control-Allow-Origin":  "localhost:4321")
        "Access-Control-Allow-Origin": getAllowedOriginHeader(url),
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    } as unknown as Headers;
}

const getAllowedOriginHeader = (url: URL) => url.hostname === "localhost" ? "*" : `${url.protocol}//${url.host}`;