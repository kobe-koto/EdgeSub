export const getDefaultHeader = url => { 
    return {
        "content-type": "application/json, charset=utf-8",
        "Access-Control-Allow-Origin":  url.hostname === "localhost" ? "*" : `${url.protocol}//${url.host}`,
        "Access-Control-Allow-Credentials": "true",
    }
}