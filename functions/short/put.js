import { getDefaultHeader } from "./utils/defaultHeader";

export async function onRequestPost (context) {
    const { request } = context;
    const url = new URL(request.url);
    const defaultHeader = getDefaultHeader(url);

    const EdgeSubDB = context.env.EdgeSubDB;
    const { 
        slug = await generatePassword(8, EdgeSubDB),
        password = await generatePassword(16),
        subdata
    } = await request.json();


    let storedData = await EdgeSubDB.get(`short:${slug}`);
    if (storedData) {
        // when data exists
        let { password: storedPassword } = JSON.parse(storedData);
        if (storedPassword !== password) { 
            // when password doesnt matchs
            return new Response(
                JSON.stringify({
                    status: 403,
                    msg: "Failed, wrong password",
                    slug,
                }), {
                    status: 403,
                    headers: defaultHeader
                }
            )
        }
    }

    // when all the things seems right, eg: data not exist or password matches.
    await EdgeSubDB.put(`short:${slug}`, JSON.stringify({
        password, subdata,
    }))
    return new Response(
        JSON.stringify({
            status: 200,
            msg: "OK",
            slug,
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
        headers: {
            //"Access-Control-Allow-Origin":  "localhost:4321")
            "Access-Control-Allow-Origin":  url.hostname === "localhost" ? "*" : `${url.protocol}//${url.host}`,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
        }
    });
}


async function generatePassword (length, EdgeSubDB = false) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let strArr = [];
    for (let i = 0, n = chars.length; i < length; i++) {
        strArr.push(chars[Math.floor(Math.random() * n)])
    }
    let str =  strArr.join("");
    if ( EdgeSubDB && !!(await EdgeSubDB.get(`short:${str}`)) ) {
        return generatePassword(length, EdgeSubDB);
    }
    return str;
}
