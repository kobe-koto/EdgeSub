import { getClashMetaConfig } from "../internal/Converter/getClashMetaConfig.js";
import getParsedSubData from "../internal/getParsedSubData.js";
import Yaml from "js-yaml";


export async function onRequest (context, isClashOriginal = false) {
    const __startTime = (new Date()).getTime();
    const { request } = context;
    const URLObject = new URL(request.url);
    let Proxies = await getParsedSubData(URLObject.searchParams.get("url"), request.headers);
    
    // process proxies if its a clash original request.
    if (isClashOriginal === true) {
        const ClashSupportedProxyType = ["trojan", "vmess", "ss", "ssr", "http", "socks5" /* "snell" */];

        console.log("✅ It's a Clash Original Config request!, filtering out these: ")
        console.log(ClashSupportedProxyType);

        // filter the proxies
        Proxies = Proxies.filter( i => ClashSupportedProxyType.includes(i.__Type) )
    }

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