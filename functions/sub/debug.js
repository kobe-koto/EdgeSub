import getParsedSubData from "../internal/getParsedSubData.ts";

export async function onRequest (context) {
    const { request } = context;
    const URLObject = new URL(request.url);
    const { Proxies } = await getParsedSubData(
        URLObject.searchParams.get("url"), 
        context.env.EdgeSubDB, 
        URLObject.searchParams.get("show_host") === "true",
        JSON.parse(URLObject.searchParams.get("http_headers")),
        URLObject.searchParams.get("ExcludeRegExpPattern"),
    );
    const ResponseBody = JSON.stringify(Proxies)
    
    return new Response(ResponseBody, {
        status: 200,
        headers: {
            "Content-Type": "application/json, charset=utf-8",
            "Content-Length": ResponseBody.length,
        }
    })
}