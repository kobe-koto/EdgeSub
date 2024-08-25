import { getSingBoxConfig } from "../internal/Converter/getSingBoxConfig.js";
import getParsedSubData from "../internal/getParsedSubData.js";

export async function onRequest (context) {
    const __startTime = (new Date()).getTime();
    const { request } = context;
    const URLObject = new URL(request.url);
    let Proxies = await getParsedSubData(URLObject.searchParams.get("url"), request.headers);

    // a javascript object !!! not YAML !!!
    let ClashMetaConfigObject = await getSingBoxConfig (
        Proxies,
        context.env.EdgeSubDB,
        {
            isUDP: URLObject.searchParams.get("udp") === "false" ? false : true,
            isInsecure: true,
            RemoteConfig: URLObject.searchParams.get("remote_config") || "__DEFAULT__",
            isForcedRefresh: URLObject.searchParams.get("forced_refresh") === "true" ? true : false
        }
    )

    console.log(`✅ [Info] [Main] [sing-box] we've done this glory, totally wasting ${(new Date()).getTime() - __startTime}ms.`)

    return new Response(JSON.stringify(ClashMetaConfigObject), {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    })
}