export const getDefaultHeader = (url: URL) => { 
    return {
        "Access-Control-Allow-Origin": getAllowedOriginHeader(url),
        "content-type": "application/json, charset=utf-8",
        "Access-Control-Allow-Credentials": "true",
    } as unknown as Headers;
}
export const getOptionsHeader = (url: URL, Methods = [ "POST" ]) => { 
    Methods.push("OPTIONS")
    return {
        //"Access-Control-Allow-Origin":  "localhost:4321")
        "Access-Control-Allow-Origin": getAllowedOriginHeader(url),
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": Methods.join(", "),
    } as unknown as Headers;
}

const getAllowedOriginHeader = (url: URL) => url.hostname === "localhost" ? "*" : `${url.protocol}//${url.host}`;