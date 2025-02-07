import { getDefaultHeader, getDefaultOptionsHeader } from "./utils/defaultHeader";

export async function onRequestPost (context) {
    const { request } = context;
    const url = new URL(request.url);
    const defaultHeader = getDefaultHeader(url);

    const EdgeSubDB = context.env.EdgeSubDB;
    let { slug, password, subdata } = await request.json();

    if (!slug && !password) {
        slug = await generatePassword(8, EdgeSubDB);
        password = await generatePassword(16);
    }


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
            password
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


async function generatePassword (length, EdgeSubDB = undefined) {
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
