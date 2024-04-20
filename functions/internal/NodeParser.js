export default class NodeParser {
    constructor () {}

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


    vless (URI) {
        let URIObject = new URL (URI);
        //console.log(URIObject)
        let VLESS = {
            __Type: "vless",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")),
            Hostname: URIObject.hostname,
            Port: URIObject.port,
            Auth: URIObject.username,
            Query: {},
        }

        for (const [key, value] of URIObject.searchParams) {
            VLESS.Query[key] = value
        }
        return VLESS;
    }
    vmess (URI) {
        let VMessRawObject = JSON.parse(atob(URI.replace(/^vmess:\/\//i, "")));
        //console.log(URIObject)

        let VMess =  {
            __Type: "vmess",
            __Remark: VMessRawObject.ps,
            Hostname: VMessRawObject.add,
            Port: VMessRawObject.port,
            Auth: VMessRawObject.id,
        }
        delete VMessRawObject.ps
        delete VMessRawObject.add
        delete VMessRawObject.port
        delete VMessRawObject.id

        // am i doing right...
        delete VMessRawObject.v // assume its version 2

        // delete all the empty fields
        for (let i in VMessRawObject) {
            if (!VMessRawObject[i]) {
                delete VMessRawObject[i]
            }
        }

        VMess.Query = VMessRawObject;

        return VMess;
    }
}
