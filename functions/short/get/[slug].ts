import { getDefaultHeader } from "../utils/defaultHeader";

export async function onRequest (context) {
    const { slug } = context.params;
    const EdgeSubDB = context.env.EdgeSubDB;
    const defaultHeader = getDefaultHeader(new URL(context.request.url));

    let storedData = await EdgeSubDB.get(`short:${slug}`);
    if (storedData) {
        let { subdata } = JSON.parse(storedData);
        return new Response(
            JSON.stringify({
                status: 200,
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
                status: 404,
                msg: "Not Found",
                slug,
            }), {
                status: 404,
                headers: defaultHeader
            }
        )
    }
}