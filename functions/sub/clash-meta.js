import { getClashMetaConfig } from "../internal/Converter/getClashMetaConfig.js";
import getParsedSubData from "../internal/getParsedSubData.ts";
import Yaml from "js-yaml";


export async function onRequest (context, isClashOriginal = false) {
    const { request } = context;
    const URLObject = new URL(request.url);
    let Proxies = await getParsedSubData(
        URLObject.searchParams.get("url"), 
        context.env.EdgeSubDB, 
        URLObject.searchParams.get("show_host") === "true",
        JSON.parse(URLObject.searchParams.get("http_headers")),
    );
    
    // process proxies if its a clash original request.
    if (isClashOriginal === true) {
        const ClashSupportedProxyType = ["trojan", "vmess", "ss", "ssr", "http", "socks5" /* "snell" */];
        const ClashSupportedSSCipher = ["aes-128-gcm", "aes-192-gcm", "aes-256-gcm", "chacha20-ietf-poly1305", "xchacha20-ietf-poly1305", "aes-128-cfb", "aes-192-cfb", "aes-256-cfb", "rc4-md5", "chacha20-ietf", "xchacha20", "aes-128-ctr", "aes-192-ctr", "aes-256-ctr"]

        console.info(`[Main] It's a Clash Original Config request!, \nfiltering out these: ${ClashSupportedProxyType.join(", ")}`)

        // filter the proxies
        Proxies = Proxies
            .filter( i => ClashSupportedProxyType.includes(i.__Type) )
            .filter( i => {
                console.log(i)
                if (i.__Type === "ss") {
                    console.log(i.Auth.cipher)
                    if (ClashSupportedSSCipher.includes(i.Auth.cipher)) {
                        return true;
                    }
                } else {
                    return true;
                }
            })
    }

    // a javascript object !!! not YAML !!!
    let ClashMetaConfigObject = await getClashMetaConfig (
        Proxies,
        context.env.EdgeSubDB,
        {
            ProxyRuleProviders: URLObject.searchParams.get("proxy_rule_providers"),
            isUDP: URLObject.searchParams.get("udp") === "true",
            isSSUoT: URLObject.searchParams.get("ss_uot") === "true",
            isInsecure: true,
            RemoteConfig: URLObject.searchParams.get("remote_config") || "__DEFAULT",
            isForcedRefresh: URLObject.searchParams.get("forced_refresh") === "true" ? true : false
        }
    )

    // handle forced ws 0-rtt
    if (URLObject.searchParams.get("forced_ws0rtt") === "true") {
        console.info("[Main] ForcedWS0RTT enabled.")
        for (let i of ClashMetaConfigObject.proxies) {
            if (!("ws-opts" in i)) {
                continue;
            }
            i["ws-opts"]["max-early-data"] = 2560
            i["ws-opts"]["early-data-header-name"] = "Sec-WebSocket-Protocol"
        }
    }

    const ResponseBody = Yaml.dump(ClashMetaConfigObject)

    return new Response(ResponseBody, {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Length": ResponseBody.length
        }
    })
}