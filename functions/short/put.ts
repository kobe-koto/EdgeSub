import { getDefaultHeader, getOptionsHeader } from "./utils/defaultHeader";

export async function onRequestPost (context) {
    const { request } = context;
    const defaultHeader = getDefaultHeader(new URL(request.url));

    const EdgeSubDB = context.env.EdgeSubDB;
    let { slug, token, subdata } = await request.json();

    if (!slug && !token) {
        slug = await generateToken(8, EdgeSubDB);
        token = await generateToken(16);
    }


    let storedData = await EdgeSubDB.get(`short:${slug}`);
    if (storedData) {
        // when data exists
        let storedJSON = JSON.parse(storedData);
        let storedToken = storedJSON.token ?? storedJSON.password;
        if (storedToken !== token) { 
            // when token doesnt matchs
            return new Response(
                JSON.stringify({
                    msg: "401 Unauthorized. Incorrect short token.",
                    slug,
                }), {
                    status: 401,
                    headers: defaultHeader
                }
            )
        }
    }

    // when all the things seems right, eg: data not exist or token matches.
    await EdgeSubDB.put(`short:${slug}`, JSON.stringify({
        token, subdata,
    }))
    return new Response(
        JSON.stringify({
            msg: "OK",
            slug,
            token
        }), {
            status: 200,
            headers: defaultHeader
        }
    )
}
export async function onRequestOptions (context) {
    return new Response("OK", {
        status: 200,
        headers: getOptionsHeader(new URL(context.request.url))
    });
}


async function generateToken (length, EdgeSubDB = undefined) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let strArr = [];
    for (let i = 0, n = chars.length; i < length; i++) {
        strArr.push(chars[Math.floor(Math.random() * n)])
    }
    let str =  strArr.join("");
    if ( EdgeSubDB && !!(await EdgeSubDB.get(`short:${str}`)) ) {
        return generateToken(length, EdgeSubDB);
    }
    return str;
}
