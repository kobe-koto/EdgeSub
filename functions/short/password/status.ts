import { getDefaultHeader, getDefaultOptionsHeader } from "../utils/defaultHeader";

export async function onRequestGet (context) {
    const { request } = context;
    const url = new URL(request.url);
    const defaultHeader = getDefaultHeader(url);

    const EdgeSubDB = context.env.EdgeSubDB;

    let hashedPassword = await EdgeSubDB.get("short_password");
    return new Response (
        JSON.stringify({
            status: 200,
            msg: "OK",
            isPasswordSet: !!hashedPassword
        }), {
            status: 200,
            headers: defaultHeader
        }
    )
}