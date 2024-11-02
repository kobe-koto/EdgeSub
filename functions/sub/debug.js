import getParsedSubData from "../internal/getParsedSubData.ts";

export async function onRequest (context) {
    const { request } = context;
    const URLObject = new URL(request.url);
    const ParsedSubData = await getParsedSubData(URLObject.searchParams.get("url"), context.env.EdgeSubDB, URLObject.searchParams.get("show_host") === "true");
    const ResponseBody = JSON.stringify(ParsedSubData)
    
    return new Response(ResponseBody, {
        status: 200,
        headers: {
            "Content-Type": "application/json, charset=utf-8",
            "Content-Length": ResponseBody.length,
        }
    })
}