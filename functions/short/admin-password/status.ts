import { getDefaultHeader, getOptionsHeader } from "../utils/defaultHeader";

export async function onRequest (context) {
    const { request } = context;
    const defaultHeader = getDefaultHeader(new URL(request.url));

    const EdgeSubDB = context.env.EdgeSubDB;

    let hashedPassword = await EdgeSubDB.get("admin-password");
    return new Response (
        JSON.stringify({
            msg: "OK",
            isPasswordSet: !!hashedPassword
        }), {
            status: 200,
            headers: defaultHeader
        }
    )
}