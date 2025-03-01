import getParsedSubData from "../internal/getParsedSubData.ts";
import { ShareLinkDumper } from "../internal/Dumpers/share-link.js";

export async function onRequest (context, isBase64 = false) {
    const { request } = context;
    const URLObject = new URL(request.url);
    // do convert
    let { data: Proxies, headers: UpstreamHeaders } = await getParsedSubData(
        URLObject.searchParams.get("url"), 
        context.env.EdgeSubDB, 
        URLObject.searchParams.get("show_host") === "true",
        JSON.parse(URLObject.searchParams.get("http_headers")),
    );
    let Dumper = new ShareLinkDumper();
    let ShareLinkArray = [];
    for (let i of Proxies) {
        if (Dumper[i.__Type]) {
            ShareLinkArray.push(Dumper[i.__Type](i))
        }
    }
    
    // generate final response
    let ShareLinkResponse = ShareLinkArray.join("\n");
    if (isBase64 === true) {
        ShareLinkResponse = btoa(ShareLinkResponse);
    }

    // 构建响应头
    const responseHeaders = {
        'Content-Type': 'text/plain; charset=utf-8',
        ...UpstreamHeaders
    };

    return new Response(ShareLinkResponse, {
        headers: responseHeaders
    })
}
