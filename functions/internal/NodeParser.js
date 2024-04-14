export default class NodeParser {
    constructor () {}
    hysteria (HYURL) {
        const URLObject = new URL (HYURL);

        const HY = {
            __Type: "hysteria",
            __Remark: decodeURIComponent(URLObject.hash.replace(/^#/, "")),
            Hostname: URLObject.hostname,
            Port: URLObject.port,
            Query: {}
        }
        for (const [key, value] of URLObject.searchParams) {
            HY.Query[key] = value
        }
        return HY;
    }
    hysteria2 (HY2URL) {
        const URLObject = new URL (HY2URL);

        const HY2 = {
            __Type: "hysteria2",
            __Remark: decodeURIComponent(URLObject.hash.replace(/^#/, "")),
            Auth: URLObject.username,
            Hostname: URLObject.hostname,
            Port: URLObject.port,
            Query: {}
        }
        for (const [key, value] of URLObject.searchParams) {
            HY2.Query[key] = value
        }
        return HY2;
    }
    hy2 = this.hysteria2;

    tuic (TUICURI) {
        let URIObject = new URL(TUICURI);

        const TUIC = {
            __Type: "tuic",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")),
            Auth: { uuid: URIObject.username, password: URIObject.password},
            Hostname: URIObject.hostname,
            Port: URIObject.port,
            Query: {}
        }
        for (const [key, value] of URIObject.searchParams) {
            TUIC.Query[key] = value
        }
        return TUIC;
    }

    http (URI) {
        let URIObject = new URL (URI);
        return {
            __Type: "http",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")),
            Hostname: URIObject.hostname,
            Port: URIObject.port,
            Auth: {
                username: URIObject.username,
                password: URIObject.password
            }
        }
    }
    socks5 (URI) {
        let URIObject = new URL (URI);
        return {
            __Type: "socks5",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")),
            Hostname: URIObject.hostname,
            Port: URIObject.port,
            Auth: {
                username: URIObject.username,
                password: URIObject.password
            }
        }
    }
}
