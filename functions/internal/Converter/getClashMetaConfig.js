import { TrulyAssign } from "../utils/TrulyAssign";
import ClashMetaDumper from "../Dumpers/clash-meta.js";
import ReadRemoteConfig from "../ReadRemoteConfig.js";

const BasicClashConfig = {
    "port": 7890,
    "socks-port": 7891,
    "allow-lan": true,
    "mode": "Rule",
    "log-level": "info",
    "external-controller": ":9090",
    "dns": {
        "enabled": true,
        "nameserver": ["119.29.29.29", "223.5.5.5"],
        "fallback": ["8.8.8.8",  "8.8.4.4",  "tls://1.0.0.1:853",  "tls://dns.google:853"]
    }
};

const BasicConfig = {
    isUDP: true,
    isInsecure: true,
    RemoteConfig: "https://raw.githubusercontent.com/kobe-koto/EdgeSub/main/assets/minimal_remote_conf/basic.ini",
    isForcedRefresh:false
}

export async function getClashMetaConfig (
    Proxies, 
    EdgeSubDB, 
    PassedConfig = {},
) {
    const Config = TrulyAssign(BasicConfig, PassedConfig);

    let RemoteConfig = await ReadRemoteConfig(Config.RemoteConfig, EdgeSubDB, Config.isForcedRefresh);
    let ClashConfig = JSON.parse(JSON.stringify(BasicClashConfig))

    // Append proxies.
    ClashConfig.proxies = [];
    for (let i of Proxies) {
        let Dumper = new ClashMetaDumper()
        if (Dumper[i.__Type]) {
            ClashConfig.proxies.push(Dumper[i.__Type](i))
        } else {
            console.log(`${i.__Type} is not supported to dump.`)
        }
    }

    // Append proxy groups.
    ClashConfig["proxy-groups"] = []
    for (let i of RemoteConfig.ProxyGroup) {

        // get Matched Proxies
        let MatchedProxies = [];
        if (i.RegExpArr.length === 0) {
            MatchedProxies = [];
        } else {
            MatchedProxies = Proxies;
            for (let t of i.RegExpArr) {
                MatchedProxies = MatchedProxies.filter( loc => loc.__Remark.match(new RegExp(t)) )
            }
        }    

        // generate proxy group 
        let GroupProxies = [];
        for (let t of i.GroupSelectors) {
            GroupProxies.push(t.replace(/^\[\]/, ""))
        }
        for (let t of MatchedProxies) {
            GroupProxies.push(t.__Remark)
        }
        if (MatchedProxies.length + i.GroupSelectors.length === 0) {
            // add fallback selector if no selector can be added
            GroupProxies.push("DIRECT")
            GroupProxies.push("REJECT")
        }

        // append proxy groupto config
        ClashConfig["proxy-groups"].push({
            name: i.name,
            type: i.type,
            proxies: GroupProxies
        })
    }

    // Append rule sets;
    ClashConfig.rules = []
    for (let i of RemoteConfig.RuleSet) {
        i.RemoteList = i.RemoteList
            .filter(l => 
                 ! (
                    l.startsWith("USER-AGENT,") ||
                    l.startsWith("URL-REGEX,")
                )
            )
        for (let t of i.RemoteList) {
            let RuleEntry = t.split(",")
            if (RuleEntry[0] === "FINAL") {
                RuleEntry[0] = "MATCH"
            }
            ClashConfig.rules.push([...RuleEntry.slice(0, 2), i.Outbound, ...RuleEntry.slice(2)].join(","))
        }
    }

    return ClashConfig;
}
