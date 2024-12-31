import { getDefaultHeader, getDefaultOptionsHeader } from "../utils/defaultHeader";
import { sha256 } from "js-sha256";

export async function onRequestPost (context) {
    const { request } = context;
    const url = new URL(request.url);
    const defaultHeader = getDefaultHeader(url);

    const EdgeSubDB = context.env.EdgeSubDB;
    const { 
        oldPassword, // will be false is client thinks the password is not set
        newPassword // new password, not hashed
    } = await request.json()
    const hashedOldPassword = sha256(oldPassword)
    const hashedNewPassword = sha256(newPassword)

    // security check?
    if (url.hostname === "localhost") {
        console.info("[setPassword - security check] in development, ignoring...")
    } else {
        if (url.protocol === "http:") {
            console.warn("[setPassword - security check] requested via http, upgrading to https")
            if (url.protocol === "http:") {
                url.protocol = "https:"
                return Response.redirect(url.toString(), 301)
            }
        }
    }

    if (!newPassword) {
        return new Response (
            JSON.stringify({
                status: 400,
                msg: "new password cant be empty",
                passwordUpdated: false
            }), {
                status: 400,
                headers: defaultHeader
            }
        )
    }


    let oldPasswordInDB = await EdgeSubDB.get("short_password");
    if (
        !oldPasswordInDB || // should be true when there isn't any old password
        hashedOldPassword == oldPasswordInDB // should be true when there is an password in db and matched
    ) {
        await EdgeSubDB.put("short_password", hashedNewPassword);
    } else {
        return new Response (
            JSON.stringify({
                status: 422,
                msg: "the provided old password does not match with the old password in database.",
                passwordUpdated: false
            }), {
                status: 422,
                headers: defaultHeader
            }
        )
    }


    return new Response (
        JSON.stringify({
            status: 200,
            msg: "OK",
            passwordUpdated: true
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
