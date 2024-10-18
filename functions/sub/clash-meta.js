import { getClashMetaConfig } from "../internal/Converter/getClashMetaConfig.js";
import getParsedSubData from "../internal/getParsedSubData.js";
import Yaml from "js-yaml";


export async function onRequest (context, isClashOriginal = false) {
    const { request } = context;
    const URLObject = new URL(request.url);
    let Proxies = await getParsedSubData(
        URLObject.searchParams.get("url"), 
        request.headers, 
        context.env.EdgeSubDB, 
        URLObject.searchParams.get("show_host") === "true"
    );
    
    // process proxies if its a clash original request.
    if (isClashOriginal === true) {
        const ClashSupportedProxyType = ["trojan", "vmess", "ss", "ssr", "http", "socks5" /* "snell" */];

        console.info(`[Main] It's a Clash Original Config request!, \nfiltering out these: ${ClashSupportedProxyType.join(", ")}`)

        // filter the proxies
        Proxies = Proxies.filter( i => ClashSupportedProxyType.includes(i.__Type) )
    }

    // a javascript object !!! not YAML !!!
    let ClashMetaConfigObject = await getClashMetaConfig (
        Proxies,
        context.env.EdgeSubDB,
        {
            isUDP: URLObject.searchParams.get("udp") === "true",
            isInsecure: true,
            RemoteConfig: URLObject.searchParams.get("remote_config") || "__DEFAULT__",
            isForcedRefresh: URLObject.searchParams.get("forced_refresh") === "true" ? true : false
        }
    )

    return new Response(Yaml.dump(ClashMetaConfigObject), {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8"
        }
    })
}