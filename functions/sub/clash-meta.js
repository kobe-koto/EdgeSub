import { getClashMetaConfig } from "../internal/Converter/getClashMetaConfig.js";
import getParsedSubData from "../internal/getParsedSubData.ts";
import Yaml from "js-yaml";


export async function onRequest (context) {
    const { request } = context;
    const URLObject = new URL(request.url);
    let Proxies = await getParsedSubData(
        URLObject.searchParams.get("url"), 
        context.env.EdgeSubDB, 
        URLObject.searchParams.get("show_host") === "true",
        JSON.parse(URLObject.searchParams.get("http_headers")),
    );

    // a javascript object !!! not YAML !!!
    let ClashMetaConfigObject = await getClashMetaConfig (
        Proxies,
        context.env.EdgeSubDB,
        {
            isUDP: URLObject.searchParams.get("udp") === "true",
            isSSUoT: URLObject.searchParams.get("ss_uot") === "true",
            isInsecure: true,
            RuleProvider: URLObject.searchParams.get("remote_config") || "__DEFAULT",
            RuleProvidersProxy: URLObject.searchParams.get("rule_providers_proxy"),
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