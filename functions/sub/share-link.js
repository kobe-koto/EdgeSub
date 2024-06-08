import getParsedSubData from "../internal/getParsedSubData.js";

import { ShareLinkDumper } from "../internal/Dumpers/share-link.js";


export async function onRequest (context) {
    const { request } = context;
    let Dumper = new ShareLinkDumper();
    const ParsedSubData = await getParsedSubData(new URL(request.url).searchParams.get("url"), request.headers);
    let ShareLinkArray = [];
    for (let i of ParsedSubData) {
        if (Dumper[i.__Type]) {
            ShareLinkArray.push(Dumper[i.__Type](i))
        }
    }

    return new Response(ShareLinkArray.join("\n"), {
        status: 200,
        headers: {
            "Content-Type": "text/plain, charset=utf-8",
        }
    })
}
