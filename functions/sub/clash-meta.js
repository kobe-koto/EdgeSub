let BasicConfig = `
port: 7890
socks-port: 7891
allow-lan: true
mode: Rule
log-level: info
external-controller: :9090
dns:
  enabled: true
  nameserver:
    - 119.29.29.29
    - 223.5.5.5
  fallback:
    - 8.8.8.8
    - 8.8.4.4
    - tls://1.0.0.1:853
    - tls://dns.google:853
`.trim();

import Yaml from "js-yaml";
import getParsedSubData from "../internal/getParsedSubData.js";
import ClashMetaDumper from "../internal/Dumpers/clash-meta.js";
let Dumper = new ClashMetaDumper()
import ReadRemoteConfig from "../internal/ReadRemoteConfig.js";


export async function onRequest (context) {
    const { request } = context;
    const ParsedSubData = await getParsedSubData(new URL(request.url).searchParams.get("url"), request.headers);
    let RemoteConfig = await ReadRemoteConfig("https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/special/basic.ini");

    let Config = Yaml.load(BasicConfig)

    // Append proxies.
    Config.proxies = [];
    for (let i of ParsedSubData) {
        if (Dumper[i.__Type]) {
            Config.proxies.push(Dumper[i.__Type](i))
        } else {
            console.log(`${i.__Type} is not supported to dump.`)
        }
    }

    // Append proxy groups.
    Config["proxy-groups"] = []
    for (let i of RemoteConfig.ProxyGroup) {
        let MatchedProxies = ParsedSubData.filter(i => i.__Remark.match(new RegExp(i.RegExp)))
        let MatchedProxiesName = [];
        for (let i of MatchedProxies) {
            MatchedProxiesName.push(i.__Remark)
        }
        Config["proxy-groups"].push({
            name: i.name,
            type: i.type,
            proxies: MatchedProxiesName
        })
    }
    // Append rule sets;
    Config.rules = []
    for (let i of RemoteConfig.RuleSet) {
        for (let t of i.List) {
            Config.rules.push(`${t},${i.Outbound}`)
        }
    }
    

    return new Response(Yaml.dump(Config), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}