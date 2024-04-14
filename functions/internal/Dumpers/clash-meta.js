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
    hysteria (hyObject) {
        return {
            name: hyObject.__Remark,
            type: hyObject.__Type,
            server: hyObject.Hostname,
            port: hyObject.Port,
            "auth_str": hyObject.Query.auth,
            "auth-str": hyObject.Query.auth,
            alpn: [hyObject.Query.alpn],
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
            alpn: [TUIC.Query.alpn],
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
}