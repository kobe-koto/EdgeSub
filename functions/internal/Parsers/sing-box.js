export class SingBoxParser {
    constructor () {}

    __validate (ProxyObject) {
        if (!(ProxyObject.type in this)) {
            console.warn(`[Parser: Sing-Box] [WARN] ${ProxyObject.__Type} is not supported to parse, ignoring...`)
            return false;
        }
        if (ProxyObject.type === "socks" && ProxyObject.version != 5) {
            console.warn(`[Parser: Sing-Box] [WARN] Only Socks version 5 is supported to parse, ignoring...`)
            return false;
        }
        return true;
    }

    http (Obj) {
        return {
            __Type: "http",
            __Remark: Obj.tag,
            Hostname: Obj.server,
            Port: Obj.server_port,
            Auth: {
                username: Obj.username,
                password: Obj.password
            }
        }
    }
    socks (Obj) {
        return {
            __Type: "socks5",
            __Remark: Obj.tag,
            Hostname: Obj.server,
            Port: Obj.server_port,
            Auth: {
                username: Obj.username,
                password: Obj.password
            }
        }
    }
    
    hysteria (Obj) {
        return {
            __Type: "hysteria",
            __Remark: Obj.tag,
            Hostname: Obj.server,
            Port: Obj.server_port,
            Query: {
                auth: (Obj["auth_str"] || Obj["auth"]),
                alpn: Obj.tls && Obj.tls.alpn ? Obj.tls.alpn.join(",") : undefined,
                upmbps: Obj.up || Obj.up_mbps,
                downmbps: Obj.down || Obj.down_mbps,
                peer: Obj.tls && Obj.tls.server_name,
                mport: Obj.server_ports ? Obj.server_ports.map(i=>i.replace(/\:/gi, "-")).join(",") : undefined,
            }
        }
    }
    hysteria2 (Obj) {
        return {
            __Type: "hysteria2",
            __Remark: Obj.tag,
            Hostname: Obj.server,
            Port: Obj.server_port,
            Auth: Obj.password,
            Query: {
                upmbps: Obj.up_mbps,
                downmbps: Obj.down_mbps,
                objs: Obj.obfs ? Obj.obfs.type : undefined,
                "obfs-password": Obj.obfs ? Obj.obfs.password : undefined,
                insecure: Obj.tls && Obj.tls.insecure ? 1 : 0,
                mport: Obj.server_ports ? Obj.server_ports.map(i=>i.replace(/\:/gi, "-")).join(",") : undefined,
            }
        }
    }

    tuic (Obj) {
        return {
            __Type: "tuic",
            __Remark: Obj.tag,
            Hostname: Obj.server,
            Port: Obj.server_port,
            Auth: { uuid: Obj.uuid, password: Obj.password },
            Query: {
                alpn: Obj.alpn ? Obj.alpn.join(",") : undefined,
                disable_sni: Obj.tls.disable_sni,
                udp_relay_mode: Obj.udp_relay_mode,
                congestion_control: Obj.congestion_control,
                sni: Obj.tls && Obj.tls.server_name,
            }
        }
    }


    vless (Obj) {
        return {
            __Type: "vless",
            __Remark: Obj.tag,
            Hostname: Obj.server,
            Port: Obj.server_port,
            Auth: Obj.uuid,
            Query: {
                flow: Obj.flow,
                packetEncoding: Obj.packet_encoding,
                sni: Obj.tls && Obj.tls.server_name,
                alpn: Obj.tls && Obj.tls.alpn ? Obj.tls.alpn.join(",") : undefined,
                fp: Obj.tls && Obj.tls.utls && Obj.tls.utls.enabled === true ? Obj.tls.utls.fingerprint: undefined,
                type: Obj.network,

                // reality
                security: Obj.tls && Obj.tls.reality && Obj.tls.reality.enabled ? "reality" : undefined,
                pbk: Obj.tls && Obj.tls.reality && Obj.tls.reality.enabled ? Obj.tls.reality["public_key"] : undefined,
                sid: Obj.tls && Obj.tls.reality && Obj.tls.reality.enabled ? Obj.tls.reality["short_id"] : undefined,

                // transport layer config
                // - ws
                ed: Obj.transport && Obj.transport["max_early_data"],
                eh: Obj.transport && Obj.transport["early_data_header_name"],
                // - grpc
                serviceName: Obj.transport && Obj.transport["service_name"],
                // - http
                method: Obj.method,
                // - http & ws
                path: Obj.transport && Obj.transport.path,
                host: (Obj.transport && Obj.transport.headers || {}).Host,
            }
        }
    }
    vmess (Obj) {
        return {
            __Type: "vmess",
            __Remark: Obj.tag,
            Hostname: Obj.server,
            Port: Obj.server_port,
            Auth: Obj.uuid,
            Query: {
                aid: Obj.alter_id,
                cipher: Obj.security,
                net: Obj.network,
                type: Obj.protocol,
                fp: Obj.tls && Obj.tls.utls ? Obj.tls.utls.fingerprint : undefined,
                alpn: Obj.alpn ? Obj.alpn.join(",") : undefined,
                tls: Obj.tls && Obj.tls.enabled ? "tls" : undefined,
                sni: Obj.server_name,

                // transport layer config
                // - http & ws & h2 
                host: (Obj.headers || {}).Host,
                // - http & ws & h2 & grpc
                path: Obj.path || undefined
            }
        }
    }

    shadowsocks (Obj) {
        return {
            __Type: "ss",
            __Remark: Obj.tag,
            Hostname: Obj.server,
            Port: Obj.server_port,
            Auth: { cipher: Obj.method, password: Obj.password },
        }
    }

    trojan (Obj) {
        return {
            __Type: "trojan",
            __Remark: Obj.tag,
            Hostname: Obj.server,
            Port: Obj.server_port,
            Auth: Obj.password,
            Query: {
                type: Obj.network,
                sni: Obj.tls && Obj.tls.server_name,

                // reality
                security: Obj.tls && Obj.tls.reality && Obj.tls.reality.enabled ? "reality" : undefined,
                pbk: Obj.tls && Obj.tls.reality && Obj.tls.reality.enabled ? Obj.tls.reality["public_key"] : undefined,
                sid: Obj.tls && Obj.tls.reality && Obj.tls.reality.enabled ? Obj.tls.reality["short_id"] : undefined,


                // transport layer config
                // - ws
                ed: Obj.transport && Obj.transport["max_early_data"],
                eh: Obj.transport && Obj.transport["early_data_header_name"],
                // - grpc
                serviceName: Obj.transport && Obj.transport["service_name"],
                // - http
                method: Obj.method,
                // - http & ws
                path: Obj.transport && Obj.transport["path"] || Obj.path,
                host: (Obj.transport && Obj.transport["headers"] || Obj.headers || {}).Host,
            }
        }
    }
}
