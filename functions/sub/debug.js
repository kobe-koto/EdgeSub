import getParsedSubData from "../internal/getParsedSubData.js";

export async function onRequest (context) {
    const { request } = context;
    const URLObject = new URL(request.url);
    const ParsedSubData = await getParsedSubData(URLObject.searchParams.get("url"), request.headers, context.env.EdgeSubDB, URLObject.searchParams.get("show_host") === "true");
    
    return new Response(JSON.stringify(ParsedSubData), {
        status: 200,
        headers: {
            "Content-Type": "application/json, charset=utf-8",
        }
    })
}