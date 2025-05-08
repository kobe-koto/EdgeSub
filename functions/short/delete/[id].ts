import { getDefaultHeader, getOptionsHeader } from "../utils/defaultHeader";

export async function onRequestDelete (context) {
    const { id } = context.params;
    const EdgeSubDB = context.env.EdgeSubDB;
    const defaultHeader = getDefaultHeader(new URL(context.request.url));

    let { token } = await context.request.json();

    if (!token) {
        return new Response(
            JSON.stringify({
                msg: "400 Bad Request. token missing or empty."
            }), {
                status: 400,
                headers: defaultHeader
            }
        )
    }


    let storedData = await EdgeSubDB.get(`short:${id}`);
    if (storedData) {
        // when data exists
        let storedJSON = JSON.parse(storedData);
        let storedToken = storedJSON.token ?? storedJSON.password;
        if (storedToken !== token) { 
            // when token doesnt matchs
            return new Response(
                JSON.stringify({
                    msg: "401 Unauthorized. Incorrect short token."
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
    await EdgeSubDB.delete(`short:${id}`)
    return new Response(
        JSON.stringify({
            msg: `200 OK. short:${id} has been deleted.`,
        }), {
            status: 200,
            headers: defaultHeader
        }
    )
}
export async function onRequestOptions (context) {
    return new Response("OK", {
        status: 200,
        headers: getOptionsHeader(new URL(context.request.url), [ "DELETE" ])
    });
}




