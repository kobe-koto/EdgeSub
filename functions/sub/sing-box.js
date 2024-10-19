import { getSingBoxConfig } from "../internal/Converter/getSingBoxConfig.js";
import getParsedSubData from "../internal/getParsedSubData.js";

export async function onRequest (context) {
    const { request } = context;
    const URLObject = new URL(request.url);
    let Proxies = await getParsedSubData(URLObject.searchParams.get("url"), request.headers, context.env.EdgeSubDB, URLObject.searchParams.get("show_host") === "true");

    // a javascript object !!! not YAML !!!
    let SingBoxConfigObject = await getSingBoxConfig (
        Proxies,
        context.env.EdgeSubDB,
        {
            isUDP: URLObject.searchParams.get("udp") === "false" ? false : true,
            isInsecure: true,
            RemoteConfig: URLObject.searchParams.get("remote_config") || "__DEFAULT__",
            isForcedRefresh: URLObject.searchParams.get("forced_refresh") === "true" ? true : false
        }
    )

    return new Response(JSON.stringify(SingBoxConfigObject), {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    })
}