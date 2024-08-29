import getParsedSubData from "../internal/getParsedSubData.js";
import { ShareLinkDumper } from "../internal/Dumpers/share-link.js";

export async function onRequest (context, isBase64 = false) {
    const { request } = context;

    // do convert
    const Proxies = await getParsedSubData(new URL(request.url).searchParams.get("url"), request.headers, context.env.EdgeSubDB);
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
        }
    })
}
