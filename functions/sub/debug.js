import getParsedSubData from "../internal/getParsedSubData.js";

export async function onRequest (context) {
    const { request } = context;
    const ParsedSubData = await getParsedSubData(new URL(request.url).searchParams.get("url"), request.headers, context.env.EdgeSubDB);
    
    return new Response(JSON.stringify(ParsedSubData), {
        status: 200,
        headers: {
            "Content-Type": "application/json, charset=utf-8",
        }
    })
}