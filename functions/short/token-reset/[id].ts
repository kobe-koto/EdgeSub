import { getDefaultHeader, getOptionsHeader } from "../utils/defaultHeader";

export async function onRequestPatch (context) {
    const { id } = context.params;
    const EdgeSubDB = context.env.EdgeSubDB;
    const defaultHeader = getDefaultHeader(new URL(context.request.url));

    let { oldToken, newToken } = await context.request.json();

    if (!oldToken || !newToken) {
        return new Response(
            JSON.stringify({
                msg: "400 Bad Request. oldToken or newToken missing or empty."
            }), {
                status: 400,
                headers: defaultHeader
            }
        )
    }


    let storedData = await EdgeSubDB.get(`short:${id}`);
    let storedJSON = JSON.parse(storedData);
    if (storedData) {
        // when data exists
        let storedToken = storedJSON.token ?? storedJSON.password;
        if (storedToken !== oldToken) { 
            // when oldToken doesnt matchs
            return new Response(
                JSON.stringify({
                    msg: "401 Unauthorized. Incorrect short oldToken."
                }), {
                    status: 401,
                    headers: defaultHeader
                }
            )
        }
    } else {
        return new Response(
            JSON.stringify({
                msg: "404 Not Found. requested short not exist.",
            }), {
                status: 404,
                headers: defaultHeader
            }
        )
    }

    // when all the things seems right, eg: data not exist or token matches.
    storedJSON.token = newToken;
    await EdgeSubDB.put(`short:${id}`, JSON.stringify(storedJSON))
    return new Response(
        JSON.stringify({
            msg: `200 OK. short:${id}'s token has been changed.`,
        }), {
            status: 200,
            headers: defaultHeader
        }
    )
}
export async function onRequestOptions (context) {
    return new Response("OK", {
        status: 200,
        headers: getOptionsHeader(new URL(context.request.url), [ "PATCH" ])
    });
}
