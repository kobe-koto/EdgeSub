import { parse as INIParse } from "ini";

import { fetchCached } from "../../utils/fetchCached.js";

export async function ini (RuleProviderURL, CacheDB, isForcedRefresh) {

    let Config = {
        RuleProviders: [],
        Rules: [],
        ProxyGroup: []
    };

    // get raw remote config.
    let RuleProvider = 
        await fetchCached(RuleProviderURL, "RuleProvider", CacheDB, isForcedRefresh)
        .then(
            res => 
                res.replaceAll("ruleset=", "ruleset[]=")
                   .replaceAll("custom_proxy_group=", "custom_proxy_group[]=")
        )
        .then(res => INIParse(res));


    // process rules
    for (let i of RuleProvider.custom.ruleset) {
        const rulesetBreakdown = i.split(",").map(i=>i.trim())
        const id = rulesetBreakdown[0];
        const payload = rulesetBreakdown.slice(1).join(",");

        // append rule providers
        if (payload.startsWith("https://") || payload.startsWith("http://")) {
            if (!Config.RuleProviders[id]) {
                Config.RuleProviders[id] = [];
            }
            Config.RuleProviders[id].push(payload)
        }

        // append route rules
        const postProcessedContent = 
            `${id},${payload
                .replace(/^\[\]FINAL/i, "MATCH")
                .replace(/^\[\]/g, "")
            }`
        Config.Rules.push(postProcessedContent)
    }

    // process proxy groups
    for (let i of RuleProvider.custom.custom_proxy_group) {
        // "特殊筛选条件" (starts with "!!") are not supported. #todo
        const ConfigArr = i.split("`").filter(t => !t.startsWith("!!"));
        const Args = ConfigArr.slice(2).filter(t => !t.startsWith("[]"));
        const type = ConfigArr[1];

        let ProxyGroupConfig = {
            name: ConfigArr[0],
            type: type,
            RegExps: Args,
            GroupSelectors: ConfigArr.slice(2).filter(t => t.startsWith("[]")),
        }
            
        if (type === "url-test" || type === "fallback" || type === "load-balance") {
            let TestURLIndex = Args.findIndex(loc => (loc.startsWith("https://") || loc.startsWith("http://")))
            let TestArgs = [Args.slice(TestURLIndex)[0], ...Args.slice(TestURLIndex)[1].split(",")];
            ProxyGroupConfig.TestConfig = {
                TestURL: TestArgs[0],
                Interval: parseInt(TestArgs[1]),
                Timeout: parseInt(TestArgs[2]),
                Tolerance: parseInt(TestArgs[3]),
            }
        }

        Config.ProxyGroup.push(ProxyGroupConfig)
    }

    return Config;

}