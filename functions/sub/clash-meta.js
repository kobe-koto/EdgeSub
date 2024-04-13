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

export async function onRequest (context) {
    const { request } = context;
    const ParsedSubData = await getParsedSubData(new URL(request.url).searchParams.get("url"), request.headers);



    let Config = Yaml.load(BasicConfig)
    Config.proxies = [];

    for (let i of ParsedSubData) {
        if (Dumper[i.__Type]) {
            Config.proxies.push(Dumper[i.__Type](i))
        } else {
            console.log(`${i.__Type} is not supported to dump.`)
        }
    }
    

    return new Response(Yaml.dump(Config), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}