export default class Dumper {
    config = {}
    constructor (
        UDP = true,
        SkipCertVerify = true,
        ClientFingerprint = "chrome"
    ) {
        this.config.UDP = UDP;
        this.config.SkipCertVerify = SkipCertVerify;
        this.config.ClientFingerprint = ClientFingerprint;

        return true;
    }

    // __appendCommonField () {}

    http (HTTP) {
        return {
            tag: HTTP.__Remark,
            type: "http",
          
            server: HTTP.Hostname,
            server_port: HTTP.Port,
            username: HTTP.Auth.username,
            password: HTTP.Auth.password,
            path: "/",
            headers: {},
            tls: {
                insecure: this.config.SkipCertVerify
            },
        }
    }
    socks5 (SOCKS5) {
        return {
            tag: SOCKS5.__Remark,
            type: "socks",
            server: SOCKS5.Hostname,
            server_port: SOCKS5.Port,
            version: "5",
            username: SOCKS5.Auth.username,
            password: SOCKS5.Auth.password,
            //udp_over_tcp: this.config.UDP ? "udp" : "tcp"
        }
    }

    hysteria (hyObject) {
        return {
            type: "hysteria",
            tag: hyObject.__Remark,
          
            server: hyObject.Hostname,
            server_port: hyObject.Port,

            // sing-box doesnt have port hopping
            // ports: hyObject.Query.mport,
            up_mbps: parseInt(hyObject.Query.upmbps) || 250,
            down_mbps: parseInt(hyObject.Query.downmbps) || 500,
            obfs: hyObject.Query.obfsParam,
            auth_str: hyObject.Query.auth,
            
            tls: {
                enabled: true,
                server_name: hyObject.Query.peer,
                insecure: this.config.SkipCertVerify
            },
        }
    }
    hysteria2 (hy2Object) {
        return {
            type: "hysteria2",
            tag: hy2Object.__Remark,
          
            server: hy2Object.Hostname,
            server_port: hy2Object.Port,

            // sing-box doesnt have port hopping
            // ports: hy2Object.Query.mport,
            up_mbps: parseInt(hy2Object.Query.upmbps) || 250,
            down_mbps: parseInt(hy2Object.Query.downmbps) || 500,
            obfs: (hy2Object.Query.obfs && hy2Object.Query["obfs-password"] ) ? {
                type: hy2Object.Query.obfs,
                password: hy2Object.Query["obfs-password"],
            } : undefined,
            password: hy2Object.Auth,
            
            tls: {
                enabled: true,
                server_name: hy2Object.Query.sni,
                insecure: this.config.SkipCertVerify,
                alpn: [
                  "h3"
                ]
            },
        }
    }
    hy2 = this.hysteria2;

    tuic (TUIC) {
        return {
            type: "tuic",
            tag: TUIC.__Remark,
          
            server: TUIC.Hostname,
            server_port: TUIC.Port,
            uuid: TUIC.Auth.uuid,
            password: TUIC.Auth.password,

            udp_relay_mode: TUIC.Query.udp_relay_mode,

            congestion_control: TUIC.Query.congestion_control,

            heartbeat: "10s",
            tls: {
                enabled: true,
                disable_sni: !!parseInt(TUIC.Query.disable_sni),
                alpn: TUIC.Query.alpn ? [ TUIC.Query.alpn ] : undefined,
                insecure: this.config.SkipCertVerify,
                server_name: TUIC.Query.sni,
            }
        }
    }

    vless (VLESS) {
        console.log(VLESS)
        return {
            type: "vless",
            tag: VLESS.__Remark,
          
            server: VLESS.Hostname,
            server_port: VLESS.Port,
            uuid: VLESS.Auth,
            flow: VLESS.Query.flow,
            packet_encoding: VLESS.Query.packetEncoding || "xudp",
            tls: !!VLESS.Query.sni ? {
                enabled: true,
                server_name: VLESS.Query.sni,
                insecure: this.config.SkipCertVerify,
                alpn: VLESS.Query.alpn ? [ VLESS.Query.alpn ] : undefined,

                utls: {
                    enabled: !!VLESS.Query.fp,
                    fingerprint: VLESS.Query.fp
                },
                reality: __genRealityConfig(VLESS),
            } : undefined,
            //"multiplex: {},
            transport: __genTransportConfig(VLESS)

        }
    }
    vmess (VMESS) {
        return {
            type: "vmess",
            tag: VMESS.__Remark,
          
            server: VMESS.Hostname,
            server_port: VMESS.Port,
            uuid: VMESS.Auth,
            security: VMESS.Query.scy ? VMESS.Query.scy : "auto",
            alter_id: VMESS.Query.aid,
            // global_padding: false, //??
            // authenticated_length: true, //??
            packet_encoding: "xudp",
            tls: (VMESS.Query.tls === "tls") ? {
                enabled: true,
                server_name: VMESS.Query.sni,
                insecure: this.config.SkipCertVerify,
                alpn: ["h2", "http/1.1"],
                utls: {
                    enabled: !!VMESS.Query.fp,
                    fingerprint: VMESS.Query.fp
                },
                reality: __genRealityConfig(VMESS),
            } : undefined,
            transport: __genTransportConfig(VMESS)
        }
    }

    ss (SS) {
        return {
            type: "shadowsocks",
            tag: SS.__Remark,
          
            server: SS.Hostname,
            server_port: SS.Port,
            method: SS.Auth.cipher,
            password: SS.Auth.password,
            udp_over_tcp: this.config.UDP ? {
                enabled: true,
                version: 2
            } : false,
        }
    }
    trojan (TROJAN) {
        return {

            type: "trojan",
            tag: TROJAN.__Remark,
          
            server: TROJAN.Hostname,
            server_port: TROJAN.Port,
            password: TROJAN.Auth,
            network: TROJAN.Query.type ? TROJAN.Query.type : "tcp",
            tls: !!TROJAN.Query.sni ? {
                enabled: true,
                server_name: TROJAN.Query.sni,
                alpn: ["h2", "http/1.1"],
                insecure: this.config.SkipCertVerify,
                utls: {
                    enabled: !!TROJAN.Query.fp,
                    fingerprint: TROJAN.Query.fp
                },
                reality: __genRealityConfig(TROJAN),
            } : undefined,
            transport: __genTransportConfig(TROJAN)

        }
    }
}
function __genRealityConfig (URIObject) {
    return (URIObject.Query.security === "reality") ? {
        enabled: true,
        public_key: URIObject.Query.pbk || undefined,
        short_id: URIObject.Query.sid || undefined
    } : undefined;
}
function __genTransportConfig (URIObject) {
    console.log(URIObject)
    const URITransportType = URIObject.Query.net || URIObject.Query.type;

    const PathObject = new URL(`path:${URIObject.Query.path}`);
    return (
        URITransportType === "http" ||
        URITransportType === "ws" ||
        URITransportType === "grpc" ||
        URITransportType === "quic" ||
        URITransportType === "httpupgrade"
    ) ? {
        type: URITransportType,

        // http
        headers: { 
            Host: 
                (URITransportType !== "quic")
                 ? URIObject.Query.host
                 : undefined,
        },
        path: PathObject.pathname || "",
        method: URIObject.Query.method,

        // max early data
        early_data_header_name: PathObject.searchParams.has("ed") ? "Sec-WebSocket-Protocol" : undefined,
        max_early_data: PathObject.searchParams.has("ed") ? parseInt(PathObject.searchParams.get("ed")) : undefined,

        // grpc
        service_name: URITransportType === "grpc" ? ( URIObject.Query.serviceName || URIObject.Query.path ) : undefined,
    } : undefined;
}