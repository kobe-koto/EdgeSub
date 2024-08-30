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
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")) || URIObject.host,
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
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")) || URIObject.host,
            Hostname: URIObject.hostname,
            Port: parseInt(URIObject.port),
            Auth: {
                username: URIObject.username,
                password: URIObject.password
            }
        }
    }
    
    hysteria (HYURL) {
        const URIObject = new URL (HYURL);

        const HY = {
            __Type: "hysteria",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")) || URIObject.host,
            Hostname: URIObject.hostname,
            Port: parseInt(URIObject.port),
            Query: __searchParamsMapper(URIObject.searchParams)
        }
        return HY;
    }
    hysteria2 (HY2URL) {
        const URIObject = new URL (HY2URL);

        const HY2 = {
            __Type: "hysteria2",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")) || URIObject.host,
            Auth: URIObject.username,
            Hostname: URIObject.hostname,
            Port: parseInt(URIObject.port),
            Query: __searchParamsMapper(URIObject.searchParams)
        }
        return HY2;
    }
    hy2 = this.hysteria2;

    tuic (TUICURI) {
        let URIObject = new URL(TUICURI);

        const TUIC = {
            __Type: "tuic",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")) || URIObject.host,
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
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")) || URIObject.host,
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
                __Remark: Remark || `${VMessRawObject.add}:${VMessRawObject.port}`,
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
                __Remark: StandardURIObj.searchParams.get("remarks") || StandardURIObj.host,
                Hostname: StandardURIObj.hostname,
                Port: parseInt(StandardURIObj.port),
                Auth: StandardURIObj.password,
                Query: {
                    aid: parseInt(StandardURIObj.searchParams.get("alterId")),
                    scy: StandardURIObj.username
                }
            }
            return VMess
        }
    }

    ss (URI) {
        let StandardURI = (URI => {
            let URIObject = new URL(URI);
            try {
                // base64-encoded cipher:uuid@host:port
                return `ss://${encodeURIComponent(atob(decodeURIComponent(URIObject.host))).replace(/\%3A/gi,":").replace(/\%40/gi,"@")}${URIObject.search}${URIObject.hash}`;
            } catch (e) {}
            try {
                // base64-encoded cipher:uuid
                return `ss://${encodeURIComponent(atob(decodeURIComponent(URIObject.username))).replace(/\%3A/i,":")}@${URIObject.host}${URIObject.search}${URIObject.hash}`;
            } catch (e) {}
            // plain
            return URI;
        })(URI)
        
        let URIObject = new URL(StandardURI);
        

        return {
            __Type: "ss",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")) || URIObject.host,
            Auth: { cipher: decodeURIComponent(URIObject.username), password: decodeURIComponent(URIObject.password) },
            Hostname: URIObject.hostname,
            Port: parseInt(URIObject.port)
        }

    }

    trojan (URI) {
        let URIObject = new URL(URI);

        const TROJAN = {
            __Type: "trojan",
            __Remark: decodeURIComponent(URIObject.hash.replace(/^#/, "")) || URIObject.host,
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