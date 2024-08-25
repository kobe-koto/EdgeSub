export class ShareLinkDumper {
    constructor () {
        return true;
    }

    __validate (ProxyObject) {
        if (!(ProxyObject.__Type in this)) {
            console.warn(`[Dumper: Share Link] [WARN] ${ProxyObject.__Type} is not supported to dump, ignoring...`)
            return false
        }
        return true;
    }

    http (HTTP) {
        return `http://${HTTP.Auth.username}:${HTTP.Auth.password}@${HTTP.Hostname}:${HTTP.Port}/#${encodeURIComponent(HTTP.__Remark)}`;
    }
    socks5 (SOCKS5) {
        return `socks5://${SOCKS5.Auth.username}:${SOCKS5.Auth.password}@${SOCKS5.Hostname}:${SOCKS5.Port}/#${encodeURIComponent(SOCKS5.__Remark)}`;
    }

    hysteria (Obj) {
        return `hysteria://${Obj.Hostname}:${Obj.Port}/${URLQueryWrapper(Obj.Query)}#${encodeURIComponent(Obj.__Remark)}`
    }
    hysteria2 (Obj) {
        return `hysteria2://${Obj.Auth}@${Obj.Hostname}:${Obj.Port}/?${URLQueryWrapper(Obj.Query)}#${encodeURIComponent(Obj.__Remark)}`
    }
    hy2 = this.hysteria2;

    tuic (Obj) {
        return `tuic://${Obj.Auth.uuid}:${Obj.Auth.password}@${Obj.Hostname}:${Obj.Port}/?${URLQueryWrapper(Obj.Query)}#${encodeURIComponent(Obj.__Remark)}`
    }

    vless (Obj) {
        return `vless://${Obj.Auth}@${Obj.Hostname}:${Obj.Port}/?${URLQueryWrapper(Obj.Query)}#${encodeURIComponent(Obj.__Remark)}`
    }
    vmess (Obj) {
        let VMESSObj = {
            ps: unescape(encodeURIComponent(Obj.__Remark)) ,
            add: Obj.Hostname,
            port: Obj.Port,
            id: Obj.Auth,
            ...Obj.Query,
        }

        return `vmess://${btoa(JSON.stringify(VMESSObj))}`
    }

    ss (Obj) {
        return `ss://${encodeURIComponent(btoa(`${Obj.Auth.cipher}:${Obj.Auth.password}`))}@${Obj.Hostname}:${Obj.Port}/#${encodeURIComponent(Obj.__Remark)}`
    }
    trojan (Obj) {
        return `trojan://${Obj.Auth}@${Obj.Hostname}:${Obj.Port}/?${URLQueryWrapper(Obj.Query)}#${encodeURIComponent(Obj.__Remark)}`
    }
}

function URLQueryWrapper (Obj) {
    let Childs = [];
    for (let i in Obj) {
        let value = Obj[i];
        if (value) {
            Childs.push(`${i}=${encodeURIComponent(Obj[i])}`)
        }
    }
    return Childs.join("&");
}
