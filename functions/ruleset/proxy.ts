import { fetchCached } from "../internal/utils/fetchCached.js";

export async function onRequest (context) {
    const { request } = context;
    const URLObject = new URL(request.url);

    const targetURL = URLObject.searchParams.get("target") as unknown as URL;
    const isForcedRefresh = URLObject.searchParams.get("forced_refresh") === "true" ? true : false;

    if (!targetURL) {
        return new Response("400 Bad Request. 'targetURL' required.", {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            }
        })
    }

    let RawData = await fetchCached(targetURL, "RuleSet", context.env.EdgeSubDB, isForcedRefresh);
    return new Response(RawData, {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Length": RawData.length
        }
    })
}
