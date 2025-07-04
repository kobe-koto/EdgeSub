import { fetchCached } from "../internal/utils/fetchCached.js";

export async function onRequest (context) {
    const { request } = context;
    const URLObject = new URL(request.url);

    const targetURL = URLObject.searchParams.get("target") as unknown as URL;

    if (!targetURL) {
        return new Response("400 Bad Request. 'targetURL' required.", {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            }
        })
    }

    let RawData = await fetch(targetURL);
    return new Response(RawData.body, {
        status: 200,
        headers: RawData.headers
    })
}
