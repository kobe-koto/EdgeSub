import { onRequest as ClashMetaOnRequest } from "./clash-meta.js";

export async function onRequest (context) {
    return await ClashMetaOnRequest(context, true)
}
