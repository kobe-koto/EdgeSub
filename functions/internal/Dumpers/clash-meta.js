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
            name: HTTP.__Remark,
            type: HTTP.__Type,
            server: HTTP.Hostname,
            port: HTTP.Port,
            username: HTTP.Auth.username,
            password: HTTP.Auth.password,
            "skip-cert-verify": this.config.SkipCertVerify
        }
    }
    socks5 (SOCKS5) {
        return {
            name: SOCKS5.__Remark,
            type: SOCKS5.__Type,
            server: SOCKS5.Hostname,
            port: SOCKS5.Port,
            username: SOCKS5.Auth.username,
            password: SOCKS5.Auth.password,
            "skip-cert-verify": this.config.SkipCertVerify,
            udp: this.config.UDP
        }
    }

    hysteria (hyObject) {
        return {
            name: hyObject.__Remark,
            type: hyObject.__Type,
            server: hyObject.Hostname,
            port: hyObject.Port,
            "auth_str": hyObject.Query.auth,
            "auth-str": hyObject.Query.auth,
            alpn: hyObject.Query.alpn ? [ hyObject.Query.alpn ] : undefined,
            up: hyObject.Query.upmbps,
            down: hyObject.Query.downmbps,
            sni: hyObject.Query.peer,
            "skip-cert-verify": this.config.SkipCertVerify,
            protocol: this.config.UDP ? "UDP" : "wechat-video",
        }
    }
    hysteria2 (hy2Object) {
        return {
            name: hy2Object.__Remark,
            type: hy2Object.__Type,
            server: hy2Object.Hostname,
            port: hy2Object.Port,
            password: hy2Object.Auth,
            auth: hy2Object.Auth,
            obfs: hy2Object.Query.obfs,
            "obfs-password": hy2Object.Query["obfs-password"],
            "client-fingerprint": this.config.ClientFingerprint,
            "skip-cert-verify": this.config.SkipCertVerify,
            udp: this.config.UDP,
        }
    }
    hy2 = this.hysteria2;

    tuic (TUIC) {
        return {
            name: TUIC.__Remark,
            type: TUIC.__Type,
            server: TUIC.Hostname,
            port: TUIC.Port,
            uuid: TUIC.Auth.uuid,
            password: TUIC.Auth.password,
            alpn: TUIC.Query.alpn ? [ TUIC.Query.alpn ] : undefined,
            "disable-sni": !!parseInt(TUIC.Query.disable_sni),
            "reduce-rtt": true,        // default
            "request-timeout": 8000,   // default
            "udp-relay-mode": TUIC.Query.udp_relay_mode,
            "congestion-controller": TUIC.Query.congestion_control,
            "skip-cert-verify": this.config.SkipCertVerify,
            sni: TUIC.Query.sni,
            // max-udp-relay-packet-size: 1500,
            // fast-open: true,
            // max-open-streams: 20,
        }
    }

    vless (VLESS) {
        return {
            name: VLESS.__Remark,
            type: VLESS.__Type,
            server: VLESS.Hostname,
            port: VLESS.Port,
            uuid: VLESS.Auth,
            flow: VLESS.Query.flow,
            "packet-encoding": VLESS.Query.packetEncoding,
            tls: !!VLESS.Query.sni,
            servername: VLESS.Query.sni,
            alpn: VLESS.Query.alpn ? [ VLESS.Query.alpn ] : undefined,
            "client-fingerprint": VLESS.Query.fp,
            network: VLESS.Query.type,

            "reality-opts": VLESS.Query.security === "reality" ? {
                "public-key": VLESS.Query.pbk,
                "short-id": VLESS.Query.sid
            } : undefined,

            // transport layer config
            "ws-opts": VLESS.Query.type === "ws" ? {
                "path": VLESS.Query.path,
                "max-early-data": VLESS.Query.ed,
                "early-data-header-name": VLESS.Query.eh,
                headers: VLESS.Query.host ? {
                    "Host": VLESS.Query.host
                } : undefined,
                //v2ray-http-upgrade
                //v2ray-http-upgrade-fast-open
            } : undefined,
            "grpc-opts": VLESS.Query.type === "grpc" ? {
                "grpc-service-name": VLESS.Query.serviceName
            } : undefined,
            "h2-opts": VLESS.Query.type === "h2" ? {
                host: VLESS.Query.host,
                path: VLESS.Query.path,
            } : undefined,
            "http-opts": VLESS.Query.type === "http" ? {
                method: VLESS.Query.method,
                path: VLESS.Query.path ? [ VLESS.Query.path ] : undefined,
                headers: VLESS.Query.host ? {
                    "Host": VLESS.Query.host
                } : undefined,
            } : undefined,

            udp: this.config.UDP,
            "skip-cert-verify": this.config.SkipCertVerify,
        }
    }
    vmess (VMESS) {
        return {
            name: VMESS.__Remark,
            type: VMESS.__Type,
            server: VMESS.Hostname,
            port: VMESS.Port,    
            uuid: VMESS.Auth,
            alterId: VMESS.Query.aid,
            cipher: VMESS.Query.scy ? VMESS.Query.scy : "auto",
            network: VMESS.Query.net,

            protocol: VMESS.Query.type,
            
            "client-fingerprint": VMESS.Query.fp,

            alpn: ["h2", "http/1.1"],

            // tls
            tls: VMESS.Query.tls === "tls",
            servername: VMESS.Query.sni,
            // "reality-opts": {
            //     "public-key": "xxxx",
            //     "short-id": "xxxx",
            // },

            // transport layer config
            "ws-opts": VMESS.Query.net === "ws" ? {
                path: VMESS.Query.path,
                headers: VMESS.Query.host ? {
                    "Host": VMESS.Query.host
                } : undefined,
                //max-early-data
                //early-data-header-name
                //v2ray-http-upgrade
                //v2ray-http-upgrade-fast-open
            } : undefined,
            "grpc-opts": VMESS.Query.net === "grpc" ? {
                "grpc-service-name": VMESS.Query.path
            } : undefined,
            "h2-opts": VMESS.Query.net === "h2" ? {
                host: VMESS.Query.host,
                path: VMESS.Query.path,
            } : undefined,
            "http-opts": VMESS.Query.net === "http" ? {
                //method: VMESS.Query.method,
                path: VMESS.Query.path,
                headers: {
                    Host: VMESS.Query.host
                }
            } : undefined,

            "skip-cert-verify": this.config.SkipCertVerify,
            udp: this.config.UDP,

            // packet-encoding
            // global-padding
            // authenticated-length
        }
    }

    ss (SS) {
        return {
            name: SS.__Remark,
            type: "ss",
            server: SS.Hostname,
            port: SS.Port,
            cipher: SS.Auth.cipher,
            password: SS.Auth.password,
  
            "udp-over-tcp": this.config.UDP,
            "udp-over-tcp-version": this.config.UDP ? 2 : undefined,
            // udp: true,
        }
    }
    trojan (TROJAN) {
        return {
            name: TROJAN.__Remark,
            type: "trojan",
            server: TROJAN.Hostname,
            port: TROJAN.Port,
            password: TROJAN.Auth,

            network: TROJAN.Query.type ? TROJAN.Query.type : "tcp",
            sni: TROJAN.Query.sni,
            alpn: ["h2", "http/1.1"],

            "reality-opts": TROJAN.Query.security === "reality" ? {
                "public-key": TROJAN.Query.pbk,
                "short-id": TROJAN.Query.sid
            } : undefined,
            
            // transport layer config
            "ws-opts": TROJAN.Query.type === "ws" ? {
                "path": TROJAN.Query.path,
                "max-early-data": TROJAN.Query.ed,
                "early-data-header-name": TROJAN.Query.eh,
                headers: TROJAN.Query.host ? {
                    "Host": TROJAN.Query.host
                } : undefined,
            } : undefined,
            "grpc-opts": TROJAN.Query.type === "grpc" ? {
                "grpc-service-name": TROJAN.Query.serviceName
            } : undefined,
            "http-opts": TROJAN.Query.type === "http" ? {
                method: TROJAN.Query.method,
                path: TROJAN.Query.path ? [ TROJAN.Query.path ] : undefined,        
                headers: TROJAN.Query.host ? {
                    "Host": TROJAN.Query.host
                } : undefined,
            } : undefined,

            "client-fingerprint": TROJAN.Query.fp,

            udp: this.config.UDP,
            "skip-cert-verify": this.config.SkipCertVerify,
        }
    }
}