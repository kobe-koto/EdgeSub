import getParsedSubData from "../internal/getParsedSubData.ts";

export async function onRequest (context) {
    const { request } = context;
    const URLObject = new URL(request.url);
    let { data: ParsedSubData, headers: UpstreamHeaders } = await getParsedSubData(
        URLObject.searchParams.get("url"), 
        context.env.EdgeSubDB, 
        URLObject.searchParams.get("show_host") === "true",
        JSON.parse(URLObject.searchParams.get("http_headers")),
    );

    let ResponseBody = JSON.stringify(ParsedSubData, null, 4);

    // 构建响应头
    const responseHeaders = {
        'Content-Type': 'application/json; charset=utf-8',
        ...UpstreamHeaders
    };

    return new Response(ResponseBody, {
        headers: responseHeaders
    })
}