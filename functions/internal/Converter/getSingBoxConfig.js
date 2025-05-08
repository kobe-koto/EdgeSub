import { TrulyAssign } from "../utils/TrulyAssign";
import SingBoxDumper from "../Dumpers/sing-box.js";

const BasicSingBoxConfig = {
    log: {
        disabled: false,
        level: "info",
    },
    dns: {
        servers: [
            {
                tag: "google",
                address: "tls://8.8.8.8"
            }, {
                tag: "local",
                address: "223.5.5.5",
                detour: "DIRECT"
            }
        ],
        rules: [
            {
                outbound: "any",
                server: "local"
            }
        ]
    },
    inbounds: [
        {
            type: "tun",
            inet4_address: "172.19.0.1/30",
            inet6_address: "fdfe:dcba:9876::1/126",
            auto_route: true,
            strict_route: false,
        }
    ],
    experimental: {
        clash_api: {
            external_controller: "127.0.0.1:9090",
            external_ui: "ui",
            secret: "",
            external_ui_download_url: "https://mirror.ghproxy.com/https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip",
            external_ui_download_detour: "DIRECT",
            default_mode: "rule"
        },
        cache_file: {
            enabled: true,
            store_fakeip: false
        }
    },
    outbounds: [
        {
            "type": "direct",
            "tag": "DIRECT"
        }, {
            "type": "dns",
            "tag": "dns-out"
        }, {
            "type": "block",
            "tag": "block"
        }, 
    ],
    route: {
        rules: [
            {
                ip_is_private: true,
                outbound: "DIRECT"
            }, {
                type: "logical",
                mode: "or",
                rules: [
                    { port: 53 },
                    { protocol: "dns" }
                ],
                outbound: "dns-out"
            }, {
                clash_mode: "direct",
                outbound: "DIRECT"
            }, {
                clash_mode: "global",
                outbound: "Proxies"
            }, {
                domain: [
                    "clash.razord.top",
                    "yacd.metacubex.one",
                    "yacd.haishan.me",
                    "d.metacubex.one"
                ],
                outbound: "DIRECT"
            },
        ],
        geosite: {
            download_detour: "DIRECT"
        },
        geoip: {
            download_detour: "DIRECT"
        },
        auto_detect_interface: true,
    },

};

const BasicConfig = {
    isUDP: true,
    isSSUoT: true,
    isInsecure: true,
    RemoteConfig: "https://raw.githubusercontent.com/kobe-koto/EdgeSub/main/public/minimal_remote_rules.ini",
    isForcedRefresh: false
}


import { RemoteConfigReader } from "../RemoteConfigReader/main.js";

export async function getSingBoxConfig (
    Proxies, 
    EdgeSubDB, 
    PassedConfig = {},
) {
    const Config = TrulyAssign(BasicConfig, PassedConfig);

    let SingBoxConfig = JSON.parse(JSON.stringify(BasicSingBoxConfig));

    // Append rule sets;
    // SingBoxConfig.route = RemoteConfig;
    // SingBoxConfig.route.rules = []
    let RemoteConfig = await (new RemoteConfigReader(Config.RemoteConfig)).Process(EdgeSubDB, Config.isForcedRefresh)
    for (let i of RemoteConfig.RuleSet) {
        i.Rules = i.Rules
            .filter(l => 
                 ! (
                    l.startsWith("USER-AGENT,") ||
                    l.startsWith("URL-REGEX,")
                )
            )

        let RouteRule = {};
        RouteRule.outbound = i.Outbound;

        for (let t of i.Rules) {
            let RuleEntry = t.split(",");
            RuleEntry[0] = RuleEntry[0].toLowerCase().replace(/\-/g, "_");
            if (RuleEntry[0] === "ip_cidr6") {
                RuleEntry[0] = "ip_cidr";
            }
            if (RuleEntry[0] === "final" || RuleEntry[0] === "match") {
                SingBoxConfig.route.final = i.Outbound;
                RouteRule = undefined
                continue;
            }
            if (!(RuleEntry[0] in RouteRule)) {
                RouteRule[RuleEntry[0]] = [];
            }
            // going to use some old fashion lol 
            if (RuleEntry[0] === "geosite" || RuleEntry[0] === "geoip") {
                RouteRule[RuleEntry[0]].push(RuleEntry[1].toLowerCase());
                continue;
            }
            // final!
            RouteRule[RuleEntry[0]].push(RuleEntry[1]);


            // cant know the file exist or not... take your own risk!
            // if (RuleEntry[0] === "GEOIP" || RuleEntry[0] === "GEOSITE") {
            //     let tag = RuleEntry.join("-").toLowerCase();
            //     SingBoxConfig.route.rules.push({
            //         rule_set: tag,
            //         outbound: i.Outbound
            //     })
            //     SingBoxConfig.route.rule_set.push({
            //             "tag": "geoip-cn",
            //             "type": "remote",
            //             "format": "binary",
            //             "url": "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs",
            //             "download_detour": "proxy"
            //     })
                
            //     continue;
            // }
        }
        if (!RouteRule) {
            continue;
        }
        SingBoxConfig.route.rules.push(RouteRule);


    }

    let Dumper = new SingBoxDumper(Config.isUDP, Config.isSSUoT, Config.isInsecure);
    // validate proxies
    Proxies = Proxies.map(i => {
        if (Dumper.__validate(i)) {
            return i;
        }
    }).filter(i => !!i);
    // append proxies
    SingBoxConfig.outbounds = [
        ...SingBoxConfig.outbounds, 
        ...Proxies.map(i => Dumper[i.__Type](i))
    ]

    //todo tags

    // Append proxy groups.
    // SingBoxConfig.outbounds = []
    for (let i of RemoteConfig.ProxyGroup) {

        // get Matched Proxies
        let MatchedProxies = [];
        for (let t of i.RegExps) {
            MatchedProxies = [ ...MatchedProxies, ...Proxies.filter( loc => loc.__Remark.match(new RegExp(t)) ) ]
        }
        // unique proxy
        MatchedProxies = Array.from(new Set(MatchedProxies));


        // generate proxies list 
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
            GroupProxies.push("block")
        }

        //generate proxy group
        let ProxyGroup = {}
        ProxyGroup.tag = i.name;
        ProxyGroup.type = i.type;


        if (i.type === "select") {
            ProxyGroup.type = "selector"
        }
        if (i.type === "url-test" || i.type === "load-balance" || i.type === "fallback") {
            ProxyGroup.type = "urltest"

            ProxyGroup.url = i.TestConfig.TestURL;
            ProxyGroup.interval = `${i.TestConfig.Interval}s`;
        }

        if (i.type === "url-test") {
            ProxyGroup.tolerance = i.TestConfig.Tolerance;
        }
        if (i.type === "load-balance" || i.type === "fallback") {
            ProxyGroup.tag += "(fallback to urltest)"
        }
        ProxyGroup.outbounds = GroupProxies;
        // append proxy group to config
        SingBoxConfig.outbounds.push(ProxyGroup)
    }

    return SingBoxConfig;
}
