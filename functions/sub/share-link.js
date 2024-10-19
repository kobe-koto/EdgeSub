import getParsedSubData from "../internal/getParsedSubData.js";
import { ShareLinkDumper } from "../internal/Dumpers/share-link.js";

export async function onRequest (context, isBase64 = false) {
    const { request } = context;
    const URLObject = new URL(request.url);
    // do convert
    const Proxies = await getParsedSubData(URLObject.searchParams.get("url"), request.headers, context.env.EdgeSubDB, URLObject.searchParams.get("show_host") === "true");
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

    return new Response(ShareLinkResponse, {
        status: 200,
        headers: {
            "Content-Type": "text/plain, charset=utf-8",
            "Content-Length": ShareLinkResponse.length
        }
    })
}
