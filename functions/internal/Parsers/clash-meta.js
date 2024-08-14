export class ClashMetaParser {
    constructor () {}

    http (Obj) {
        return {
            __Type: "http",
            __Remark: Obj.name,
            Hostname: Obj.server,
            Port: Obj.port,
            Auth: {
                username: Obj.username,
                password: Obj.password
            }
        }
    }
    socks5 (Obj) {
        return {
            __Type: "socks5",
            __Remark: Obj.name,
            Hostname: Obj.server,
            Port: Obj.port,
            Auth: {
                username: Obj.username,
                password: Obj.password
            }
        }
    }
    
    hysteria (Obj) {
        return {
            __Type: "hysteria",
            __Remark: Obj.name,
            Hostname: Obj.server,
            Port: Obj.port,
            Query: {
                auth: (Obj["auth_str"] || Obj["auth-str"]),
                alpn: Obj.alpn ? Obj.alpn.join(",") : undefined,
                upmbps: Obj.up,
                downmbps: Obj.down,
                peer: Obj.sni,
                mport: Obj.ports,
            }
        }
    }
    hysteria2 (Obj) {
        return {
            __Type: "hysteria2",
            __Remark: Obj.name,
            Hostname: Obj.server,
            Port: Obj.port,
            Auth: Obj.auth || Obj.password,
            Query: {
                objs: Obj.obfs,
                "obfs-password": Obj["obfs-password"],
                insecure: Obj["skip-cert-verify"] ? 1 : 0,
                mport: Obj.ports,
            }
        }
    }
    hy2 = this.hysteria2;

    tuic (Obj) {
        return {
            __Type: "tuic",
            __Remark: Obj.name,
            Hostname: Obj.server,
            Port: Obj.port,
            Auth: { uuid: Obj.uuid, password: Obj.password },
            Query: {
                alpn: Obj.alpn ? Obj.alpn.join(",") : undefined,
                disable_sni: Obj["disable-sni"],
                udp_relay_mode: Obj["udp-relay-mode"],
                congestion_control: Obj["congestion-controller"],
                sni: Obj.sni,
            }
        }
    }


    vless (Obj) {
        return {
            __Type: "vless",
            __Remark: Obj.name,
            Hostname: Obj.server,
            Port: Obj.port,
            Auth: Obj.uuid,
            Query: {
                flow: Obj.flow,
                packetEncoding: Obj["packet-encoding"],
                sni: Obj.servername,
                alpn: Obj.alpn ? Obj.alpn.join(",") : undefined,
                fp: Obj["client-fingerprint"],
                type: Obj.network,


                // reality
                security: !!Obj["reality-opts"] ? "reality": undefined,
                pbk: Obj["public-key"],
                sid: Obj["short-id"],

                
                // transport layer config
                
                // - ws
                ed: Obj["max-early-data"],
                eh: Obj["early-data-header-name"],

                // - grpc
                serviceName: Obj["grpc-service-name"],

                // - http
                method: Obj.method,

                // - http & ws & h2
                path: Obj.path,
                host: Obj.host || (Obj.headers || {}).Host,
            }
        }
    }
    vmess (Obj) {
        return {
            __Type: "vmess",
            __Remark: Obj.name,
            Hostname: Obj.server,
            Port: Obj.port,
            Auth: Obj.uuid,
            Query: {
                aid: Obj.alterId,
                cipher: Obj.cipher,
                net: Obj.network,
                type: Obj.protocol,
                fp: Obj["client-fingerprint"],
                alpn: Obj.alpn ? Obj.alpn.join(",") : undefined,
                tls: Obj.tls ? "tls" : undefined,
                sni: Obj.servername,

                // transport layer config
                // - http & ws & h2 
                host: (Obj.headers || {}).Host,
                // - http & ws & h2 & grpc
                path: 
                    ( Obj["ws-opts"] || Obj["h2-opts"] || {} ).path || 
                    ( (Obj["http-opts"] || {}).path || [] )[0] || 
                    Obj["grpc-service-name"] ||
                    undefined,

            }
        }
    }

    ss (Obj) {
        return {
            __Type: "ss",
            __Remark: Obj.name,
            Hostname: Obj.server,
            Port: Obj.port,
            Auth: { cipher: Obj.cipher, password: Obj.password },
        }
    }

    trojan (Obj) {
        return {
            __Type: "trojan",
            __Remark: Obj.name,
            Hostname: Obj.server,
            Port: Obj.port,
            Auth: Obj.password,
            Query: {
                type: Obj.network,
                sni: Obj.sni,

                // reality
                security: !!Obj["reality-opts"] ? "reality" : undefined,
                pbk: Obj["public-key"],
                sid: Obj["short-id"],


                // transport layer config
                
                // - ws
                ed: Obj["max-early-data"],
                eh: Obj["early-data-header-name"],

                // - grpc
                serviceName: Obj["grpc-service-name"],

                // - http
                method: Obj.method,

                // - http & ws
                path: Obj.path,
                host: (Obj.headers || {}).Host,
            }
        }
    }
}

function __searchParamsMapper (searchParams) {
    let Query = {}
    for (const [key, value] of searchParams) {
        Query[key] = value
    }
    return Query;
}
