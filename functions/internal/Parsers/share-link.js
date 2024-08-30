export class ShareLinkParser {
    constructor () {}

    __validate (URI) {
        if (!(URI.split(":")[0] in this)) {
            console.warn(`[Parser: Share Link] [WARN] ${URI.__Type} is not supported to parse, ignoring...`)
            return false;
        }
        return true;
    }

    http (URI) {
        let URIObject = new URL (URI);
        return {
            __Type: "http",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")),
            Hostname: URIObject.hostname,
            Port: parseInt(URIObject.port),
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
            Port: parseInt(URIObject.port),
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
            Port: parseInt(URLObject.port),
            Query: __searchParamsMapper(URLObject.searchParams)
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
            Port: parseInt(URLObject.port),
            Query: __searchParamsMapper(URLObject.searchParams)
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
            Port: parseInt(URIObject.port),
            Query: __searchParamsMapper(URIObject.searchParams)
        }
        return TUIC;
    }


    vless (URI) {
        let URIObject = new URL (URI);
        let VLESS = {
            __Type: "vless",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")),
            Hostname: URIObject.hostname,
            Port: parseInt(URIObject.port),
            Auth: URIObject.username,
            Query: __searchParamsMapper(URIObject.searchParams)
        }
        return VLESS;
    }
    vmess (URI) {
        let URIObject = new URL(URI);
        let VMessRawData = atob(URIObject.host);
        try {
            let VMessRawObject = JSON.parse(VMessRawData);

            let Remark;
            try {
                Remark = decodeURIComponent(escape(VMessRawObject.ps))
            } catch (e) {
                Remark = VMessRawObject.ps
            }
            let VMess =  {
                __Type: "vmess",
                __Remark: Remark,
                Hostname: VMessRawObject.add,
                Port: parseInt(VMessRawObject.port),
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
                if (
                    VMessRawObject[i] === "" || 
                    VMessRawObject[i] === null || 
                    VMessRawObject[i] === undefined
                ) {
                    delete VMessRawObject[i]
                }
            }

            VMessRawObject.aid = parseInt(VMessRawObject.aid)

            VMess.Query = VMessRawObject;

            return VMess;
        } catch (err) {
            let StandardURIObj = new URL(`vmess://${VMessRawData}${URIObject.pathname}${URIObject.search}`)
            let VMess =  {
                //__Type: "vmess",
                __Type: "vmess_shadowsocks-type",
                __Remark: StandardURIObj.searchParams.get("remarks"),
                Hostname: StandardURIObj.hostname,
                Port: parseInt(StandardURIObj.port),
                Auth: StandardURIObj.password,
                Query: {
                    aid: StandardURIObj.searchParams.get("alterId"),
                    scy: StandardURIObj.username
                }
            }
            return VMess
        }
    }

    ss (URI) {
        let URIObject = new URL(URI);

        // let's if we can decode host as base64 data
        try {
            let newURI = `ss://${atob(URIObject.host)}${URIObject.hash}`;
            let newURIObject = new URL(newURI);

            const SS = {
                __Type: "ss",
                __Remark: decodeURIComponent(newURIObject.hash.replace(/^#/, "")),
                Auth: { cipher: newURIObject.username, password: newURIObject.password },
                Hostname: newURIObject.hostname,
                Port: parseInt(newURIObject.port)
            }
            return SS;

        } catch { // no its not
            let Auth = atob(decodeURIComponent(URIObject.username)).split(":");

            const SS = {
                __Type: "ss",
                __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")),
                Auth: { cipher: Auth[0], password: Auth[1] },
                Hostname: URIObject.hostname,
                Port: parseInt(URIObject.port)
            }
            return SS;
        }


    }

    trojan (URI) {
        let URIObject = new URL(URI);

        const TROJAN = {
            __Type: "trojan",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")),
            Auth: URIObject.username,
            Hostname: URIObject.hostname,
            Port: parseInt(URIObject.port),
            Query: __searchParamsMapper(URIObject.searchParams)
        }
        return TROJAN;
    }
}

function __searchParamsMapper (searchParams) {
    let Query = {}
    for (const [key, value] of searchParams) {
        Query[key] = value
    }
    return Query;
}