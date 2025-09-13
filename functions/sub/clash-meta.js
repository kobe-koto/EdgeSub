import { getClashMetaConfig } from "../internal/Converter/getClashMetaConfig.js";
import getParsedSubData from "../internal/getParsedSubData.ts";
import { stringifyYAML } from "confbox";


export async function onRequest (context) {
    const { request } = context;
    const URLObject = new URL(request.url);
    let { Proxies, SubscriptionUserInfos } = await getParsedSubData(
        URLObject.searchParams.get("url"), 
        context.env.EdgeSubDB, 
        URLObject.searchParams.get("show_host") === "true",
        JSON.parse(URLObject.searchParams.get("http_headers")),
        URLObject.searchParams.get("ExcludeRegExpPattern"),
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
            BaseConfig: URLObject.searchParams.get("BaseConfig"),
            isForcedRefresh: URLObject.searchParams.get("forced_refresh") === "true",
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

    const ResponseBody = stringifyYAML(ClashMetaConfigObject);
    const response = new Response(
        ResponseBody, 
        {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Content-Length": ResponseBody.length,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            }
        }
    )

    if (SubscriptionUserInfos.length > 0) {
        let Names = SubscriptionUserInfos.map(i => i.name).filter(i => !!i);
        // two name, then eclipse...
        let NamesLimit = Names.length > 2 ? 2 : Names.length;
        let Filename = `${Names.slice(0, NamesLimit).join(", ")}, and ${SubscriptionUserInfos.length - NamesLimit} more`;
        response.headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(Filename)}.yaml`);

        let Traffic = SubscriptionUserInfos.map(i => i.traffic).filter(i => !!i)[0]; // first element of SubscriptionUserInfos
        // if Names.length > 1, then we shouldn't use such per-profile specific traffic values.
        if (Names.length === 1) {
            response.headers.set("Subscription-UserInfo", Traffic);
        }
    }
    
    return response;
}