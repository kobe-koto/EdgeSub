import { getDefaultHeader, getDefaultOptionsHeader } from "./utils/defaultHeader";
import { sha256 } from "js-sha256";

export async function onRequestPost (context) {
    const { request } = context;
    const url = new URL(request.url);
    const defaultHeader = getDefaultHeader(url);

    const EdgeSubDB = context.env.EdgeSubDB;

    const { password } = await request.json()
    const hashedPassword = sha256(password)
    const hashedPasswordInDB = await EdgeSubDB.get("short_password");

    // check for password
    if (hashedPassword !== hashedPasswordInDB) {
        return new Response (
            JSON.stringify({
                status: 401,
                msg: "the provided old password does not match with the old password in database",
                success: false,
                shortIDs: []
            }), {
                status: 401,
                headers: defaultHeader
            }
        )
    }

    const shortIDs = ((await EdgeSubDB.list({ prefix: "short:" })).keys || []).map(i => i.name);

    return new Response (
        JSON.stringify({
            status: 200,
            msg: "OK",
            success: true,
            shortIDs
        }), {
            status: 200,
            headers: defaultHeader
        }
    )

}
export async function onRequestOptions (context) {
    const url = new URL(context.request.url);
    return new Response("OK", {
        status: 200,
        headers: getDefaultOptionsHeader(url)
    });
}
