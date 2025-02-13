import { getDefaultHeader } from "../utils/defaultHeader";

export async function onRequest (context) {
    const { id } = context.params;
    const EdgeSubDB = context.env.EdgeSubDB;
    const defaultHeader = getDefaultHeader(new URL(context.request.url));

    let storedData = await EdgeSubDB.get(`short:${id}`);
    if (storedData) {
        let { subdata } = JSON.parse(storedData);
        return new Response(
            JSON.stringify({
                msg: "OK",
                subdata,
            }), {
                status: 200,
                headers: defaultHeader
            }
        )
    } else {
        return new Response(
            JSON.stringify({
                msg: "Not Found"
            }), {
                status: 404,
                headers: defaultHeader
            }
        )
    }
}