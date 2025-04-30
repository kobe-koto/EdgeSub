import type { RealityConfig, TransportGRPC, TransportH2, TransportHTTP, TransportWS } from "../types/ClashMetaConfig";

export default class Dumper {
    config = {
        UDP: true,
        SSUoT: true,
        SkipCertVerify: true,
        ClientFingerprint: "chrome"
    }
    constructor (
        UDP = true,
        SSUoT = true,
        SkipCertVerify = true,
        ClientFingerprint = "chrome"
    ) {
        this.config.UDP = UDP;
        this.config.SSUoT = SSUoT;
        this.config.SkipCertVerify = SkipCertVerify;
        this.config.ClientFingerprint = ClientFingerprint;

        return this;
    }

    // __appendCommonField () {}

    __validate (ProxyObject) {
        if (!(ProxyObject.__Type in this)) {
            console.warn(`[Dumper: Clash Meta] [WARN] ${ProxyObject.__Type} is not supported to dump, ignoring...`)
            return false;
        }
        return true;
    }

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
            ports: hyObject.Query.mport,
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
            ports: hy2Object.Query.mport,
            password: hy2Object.Auth,
            sni: hy2Object.Query.sni,
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

            "reality-opts": __genRealityConfig(VLESS),

            // transport layer config
            "ws-opts": __genTransportWS(VLESS),
            "grpc-opts": __genTransportGRPC(VLESS),
            "h2-opts": __genTransportH2(VLESS),
            "http-opts": __genTransportHTTP(VLESS),

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
            "ws-opts": __genTransportWS(VMESS),
            "grpc-opts": __genTransportGRPC(VMESS),
            "h2-opts": __genTransportH2(VMESS),
            "http-opts": __genTransportHTTP(VMESS),

            "skip-cert-verify": this.config.SkipCertVerify,
            udp: this.config.UDP,

            // packet-encoding
            // global-padding
            // authenticated-length
        }
    }
    vmess__shadowsocks_type (VMESS) {
        return {
            name: VMESS.__Remark,
            type: "vmess",
            server: VMESS.Hostname,
            port: VMESS.Port,    
            uuid: VMESS.Auth,
            alterId: parseInt(VMESS.Query.alterId),
            cipher: "auto",
            network: VMESS.Query.obfs,
            

            // tls
            tls: VMESS.Query.tls === "1",
            servername: VMESS.Query.peer,

            // transport layer config
            "ws-opts": __genTransportWS(VMESS),
            "grpc-opts": __genTransportGRPC(VMESS),
            "http-opts": __genTransportHTTP(VMESS),
            "h2-opts": __genTransportH2(VMESS),

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
  
            udp: this.config.UDP,
            "udp-over-tcp": this.config.SSUoT,
            "udp-over-tcp-version": this.config.SSUoT ? 2 : undefined,
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

            "reality-opts": __genRealityConfig(TROJAN),
            
            // transport layer config
            "ws-opts": __genTransportWS(TROJAN),
            "grpc-opts": __genTransportGRPC(TROJAN),
            "http-opts": __genTransportHTTP(TROJAN),

            "client-fingerprint": TROJAN.Query.fp,

            udp: this.config.UDP,
            "skip-cert-verify": this.config.SkipCertVerify,
        }
    }
}


function __genRealityConfig (Obj) : RealityConfig | undefined {
    return Obj.Query.security === "reality" ? {
        "public-key": Obj.Query.pbk ? Obj.Query.pbk : undefined,
        "short-id": Obj.Query.sid ? Obj.Query.sid : undefined
    } : undefined
}


function __genTransportWS (Obj) : TransportWS | undefined {
    const PassedTransportType = Obj.Query.obfs || Obj.Query.net || Obj.Query.type;

    if (PassedTransportType !== "ws") {
        return undefined;
    }

    const host = Obj.Query.host || Obj.Query.obfsParam;
    const PathObj = new URL(`path:${Obj.Query.path}`)
    const ParsedMaxEarlyData = parseInt(Obj.Query.ed || PathObj.searchParams.get("ed"));
    
    const MaxEarlyData = isNaN(ParsedMaxEarlyData) ? undefined : ParsedMaxEarlyData;
    const EarlyDataHeaderName = Obj.Query.eh || (MaxEarlyData ? "Sec-WebSocket-Protocol" : undefined)

    return {
        path: PathObj.pathname,
        headers: host ? { host } : undefined,
        "max-early-data": MaxEarlyData,
        "early-data-header-name": EarlyDataHeaderName,
        //"v2ray-http-upgrade"?: unknown,
        //"v2ray-http-upgrade-fast-open"?: unknown,
    }
}
function __genTransportGRPC (Obj) : TransportGRPC | undefined {
    const PassedTransportType = Obj.Query.obfs || Obj.Query.net || Obj.Query.type;
    return PassedTransportType === "grpc" ? {
        "grpc-service-name": Obj.Query.serviceName || Obj.Query.path
    } : undefined;
}

function __genTransportHTTP (Obj) : TransportHTTP | undefined {
    const PassedTransportType = Obj.Query.obfs || Obj.Query.net || Obj.Query.type;
    const host = Obj.Query.host || Obj.Query.obfsParam;
    return PassedTransportType === "http" ? {
        method: Obj.Query.method,
        path: Obj.Query.path ? [ Obj.Query.path ] : undefined,
        headers: host ? { host } : undefined,
    } : undefined;
}
function __genTransportH2 (Obj) : TransportH2 | undefined {
    const PassedTransportType = Obj.Query.obfs || Obj.Query.net || Obj.Query.type;
    return PassedTransportType === "h2" ? {
        method: Obj.Query.method,
        path: Obj.Query.path,
    } : undefined;
}
