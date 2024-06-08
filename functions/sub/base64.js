import { onRequest as ShareLinkOnRequest } from "./share-link.js";

export async function onRequest (context) {
    return await ShareLinkOnRequest(context, true)
}
