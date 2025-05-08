import { getSingBoxConfig } from "../internal/Converter/getSingBoxConfig.js";
import getParsedSubData from "../internal/getParsedSubData.ts";

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
    let SingBoxConfigObject = await getSingBoxConfig (
        Proxies,
        context.env.EdgeSubDB,
        {
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
        for (let i of SingBoxConfigObject.outbounds) {
            if (!("transport" in i)) {
                continue;
            }
            if (i.transport.type !== "ws") {
                continue;
            }
            i.transport.max_early_data = 2560
            i.transport.early_data_header_name = "Sec-WebSocket-Protocol"
        }
    }

    const ResponseBody = JSON.stringify(SingBoxConfigObject)

    return new Response(ResponseBody, {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": ResponseBody.length,
        }
    })
}