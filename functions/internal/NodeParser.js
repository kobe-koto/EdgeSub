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

    socks5 (URI) {
        let URIObject = new URL (URI);
        //console.log(socks5URI)
        return {

            __Type: "socks5",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")),
            Hostname: URIObject.hostname,
            Port: URIObject.port,
            Query: {
                username: URIObject.username,
                password: URIObject.password
            }
        }
    }
}
