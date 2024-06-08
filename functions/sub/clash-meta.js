import { getClashMetaConfig } from "../internal/Converter/getClashMetaConfig.js";
import getParsedSubData from "../internal/getParsedSubData.js";
import Yaml from "js-yaml";


export async function onRequest (context) {
    const __startTime = (new Date()).getTime();
    const { request } = context;
    const URLObject = new URL(request.url);
    let Proxies = await getParsedSubData(URLObject.searchParams.get("url"), request.headers);
    

    // a javascript object !!! not YAML !!!
    let ClashMetaConfigObject = await getClashMetaConfig (
        Proxies,
        context.env.EdgeSubDB,
        {
            isUDP: true,
            isInsecure: true,
            RemoteConfig: URLObject.searchParams.get("remote_config"),
            isForcedRefresh: URLObject.searchParams.get("forced_refresh")
        }
    )

    console.log(`✅ [Info] [Main] [clash-meta] we've done this glory, totally wasting ${(new Date()).getTime() - __startTime}ms.`)

    return new Response(Yaml.dump(ClashMetaConfigObject), {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8"
        }
    })
}