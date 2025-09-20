import { TrulyAssign } from "../utils/TrulyAssign";
import SingBoxDumper from "../Dumpers/sing-box.js";
import { MetaToSingRuleMapping } from "../data/rule/MetaToSingMapping.js";
import { parseJSON5 } from "confbox";

const BasicConfig = {
    isUDP: true,
    isSSUoT: true,
    isInsecure: true,
    RuleProvider: "https://raw.githubusercontent.com/kobe-koto/EdgeSub/main/public/minimal_remote_rules.ini",
    RuleProvidersProxy: true, // this is required
    BaseConfig: "https://raw.githubusercontent.com/kobe-koto/EdgeSub/main/public/basic-config/sing-box.json5",
    isForcedRefresh: false
}


import { RuleProviderReader } from "../RuleProviderReader/main.js";

export async function getSingBoxConfig (
    Proxies, 
    EdgeSubDB, 
    PassedConfig = {},
) {
    const Config = TrulyAssign(BasicConfig, PassedConfig);
    if (!Config.RuleProvidersProxy) {
        throw new Error("RuleProvidersProxy is required for SingBox config generation.");
    }

    console.log(`[getSingBoxConfig] fetching base config from remote (${Config.BaseConfig})`)
    const SingBoxConfig = parseJSON5(await fetch(Config.BaseConfig).then(res => res.text())) as any;
    console.log("[getSingBoxConfig] fetched base config", SingBoxConfig)

    // Process OutBounds
    let Dumper = new SingBoxDumper(Config.isUDP, Config.isSSUoT, Config.isInsecure);
    // validate proxies
    Proxies = Proxies.map(i => {
        if (Dumper.__validate(i)) {
            return i;
        }
    }).filter(i => !!i);
    // append proxies
    SingBoxConfig.outbounds = SingBoxConfig.outbounds || [];
    SingBoxConfig.outbounds = [
        ...SingBoxConfig.outbounds, 
        ...Proxies.map(i => Dumper[i.__Type](i))
    ]
    // check for essential outbounds
    if (!SingBoxConfig.outbounds.find(i => i.tag === "DIRECT")) {
        SingBoxConfig.outbounds.push({
            type: "direct",
            tag: "DIRECT"
        })
    }
    if (!SingBoxConfig.outbounds.find(i => i.tag === "REJECT")) {
        SingBoxConfig.outbounds.push({
            type: "block",
            tag: "REJECT"
        })
    }

    // proxy clash external ui archive
    if (SingBoxConfig.experimental.clash_api.external_ui_download_url) {
        let ClashWebUIURLObject = new URL(Config.RuleProvidersProxy);
            ClashWebUIURLObject.pathname = "/ruleset/proxy";
            ClashWebUIURLObject.search = "";
            ClashWebUIURLObject.searchParams.append("target", SingBoxConfig.experimental.clash_api.external_ui_download_url);
        SingBoxConfig.experimental.clash_api.external_ui_download_url = ClashWebUIURLObject.toString();
    }


    // RULES!;
    let RuleProvider = await (new RuleProviderReader(Config.RuleProvider)).Process(EdgeSubDB, Config.isForcedRefresh)
    console.log(RuleProvider)

    // Append proxy groups.
    // SingBoxConfig.outbounds = []
    // GLOBAL selector
    SingBoxConfig.outbounds.push({
        tag: "GLOBAL",
        type: "selector",
        outbounds: [ "DIRECT", "REJECT", ...Proxies.map(i => i.__Remark)]
    })
    // Respect RuleProvider
    for (let i of RuleProvider.ProxyGroup) {

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
            GroupProxies.push("REJECT")
        }

        //generate proxy group
        let ProxyGroup: {
            type: string,
            tag: string,
            outbounds: string[],
            url?: string | URL, // for url-test onlly
            interval?: string, // for url-test onlly
            tolerance?: string, // for url-test onlly
        } = {
            tag: i.name,
            type: "", // placeholder... change it later
            outbounds: GroupProxies
        }


        if (i.type === "select") {
            ProxyGroup.type = "selector"
        } else if (i.type === "url-test" || i.type === "load-balance" || i.type === "fallback") {
            ProxyGroup.type = "urltest"

            ProxyGroup.url = i.TestConfig.TestURL;
            ProxyGroup.interval = `${i.TestConfig.Interval}s`;

            if (i.type === "url-test") {
                ProxyGroup.tolerance = i.TestConfig.Tolerance;
            }
            if (i.type === "load-balance" || i.type === "fallback") {
                console.log(`[getSingBoxConfig] ${i.name} fallback to urltest`)
            }
        }

        // append proxy group to config
        SingBoxConfig.outbounds.push(ProxyGroup)
    }

    // Append rule-sets
    // SingBoxConfig.route.rule_set = [];
    let RuleProvidersMapping = {}; // { URL: ID }[]
    for (let i in RuleProvider.RuleProviders) {
        for (let t in RuleProvider.RuleProviders[i]) {
            const RuleProviderPayload = RuleProvider.RuleProviders[i][t];
            const RuleProviderID = `${i}__${t}`;
            RuleProvidersMapping[RuleProviderPayload] = RuleProviderID;

            // construct RuleProviderURL
            let RuleProviderURLObject = new URL(Config.RuleProvidersProxy);
                RuleProviderURLObject.pathname = "/ruleset/preprocessor/sing-box"
                RuleProviderURLObject.search = ""
                RuleProviderURLObject.searchParams.append("target", RuleProviderPayload)
            const RuleProviderURL = RuleProviderURLObject.toString()
            SingBoxConfig.route.rule_set.push({
                type: "remote",
                tag: RuleProviderID,
                format: "source",
                url: RuleProviderURL,
                download_detour: "DIRECT"
            })
        }
    }

    // Append rules
    // SingBoxConfig.route.rules = []
    let FinalOutboundID;
    for (let i of RuleProvider.Rules) {
        const rulesetBreakdown = i.split(",").map(i => i.trim())
        const outboundID = rulesetBreakdown[0];
        // parse in simple rules <OUTBOUND>,<TYPE>,<PAYLOAD>
        const type = MetaToSingRuleMapping[rulesetBreakdown[1]] as string;
        const payload = rulesetBreakdown.slice(2).join(",") as string;
        
        // parse in rule-set route rules
        const RuleSetPayload = rulesetBreakdown.slice(1).join(",");
        if (RuleSetPayload.startsWith("http://") || RuleSetPayload.startsWith("https://")) {
            SingBoxConfig.route.rules.push({
                rule_set: RuleProvidersMapping[RuleSetPayload],
                action: "route",
                outbound: outboundID
            });
            continue;
        }

        // handle Match Type Rule (Final Ooutbound)
        if (rulesetBreakdown[1] === "MATCH") {
            FinalOutboundID = outboundID;
            continue
        }

        // handle GEOIP and GEOSITE
        if (type === "geoip" || type === "geosite") {
            const RuleSetTag = `${type}-${payload.toLowerCase()}`;

            // if we cant find rule set with same tag (ie append before), 
            if (!(SingBoxConfig.route.rule_set.find(i => i.tag === RuleSetTag))) { 
                // let edge-sub preprocess the rule-set
                // construct url
                let RuleSetURLObject = new URL(Config.RuleProvidersProxy);
                    RuleSetURLObject.pathname = "/ruleset/proxy";
                    RuleSetURLObject.search = "";
                    RuleSetURLObject.searchParams.append("target", `https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/${RuleSetTag}.srs`);
                const RuleSetURL = RuleSetURLObject.toString();

                // append rule-set
                SingBoxConfig.route.rule_set.push({
                    type: "remote",
                    tag: RuleSetTag,
                    format: "binary",
                    url: RuleSetURL,
                    download_detour: "DIRECT"
                })
            }

            // use the appended rule-set to route 
            SingBoxConfig.route.rules.push({
                rule_set: RuleSetTag,
                action: "route",
                outbound: outboundID
            });
            continue;
        }

        // handle the types that payload need to be number
        if (type === "source_port" || type === "port") {
            let numPayload = Number(payload);
            if (isNaN(numPayload)) {
                console.warn(`[getSingBoxConfig] invalid port number: ${payload}, skiping rule ${i}`);
                continue;
            }
            SingBoxConfig.route.rules.push({
                [type]: numPayload,
                action: "route",
                outbound: outboundID
            });
            continue;
        }

        // any other route rules else should works... not sure since sing-box always breaking 
        SingBoxConfig.route.rules.push({
            [type]: payload,
            action: "route",
            outbound: outboundID
        });
    }
    // Append Final Outbound
    SingBoxConfig.route.final = FinalOutboundID;

    return SingBoxConfig;
}
