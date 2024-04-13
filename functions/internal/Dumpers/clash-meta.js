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
    hysteria2 (hy2Object) {
        return {
            type: hy2Object.__Type,
            name: hy2Object.__Remark,
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
}