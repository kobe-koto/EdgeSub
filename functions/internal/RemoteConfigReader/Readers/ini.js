import { parse as INIParse } from "ini";

import { fetchCached } from "../../utils/fetchCached.js";

export async function ini (RemoteConfigURL, CacheDB, isForcedRefresh) {

    let Config = {
        RuleProviders: [],
        Rules: [],
        ProxyGroup: []
    };

    // get raw remote config.
    let RemoteConfig = 
        await fetchCached(RemoteConfigURL, "RemoteConfig", CacheDB, isForcedRefresh)
        .then(
            res => 
                res.replaceAll("ruleset=", "ruleset[]=")
                   .replaceAll("custom_proxy_group=", "custom_proxy_group[]=")
        )
        .then(res => INIParse(res));


    // process rules
    for (let i of RemoteConfig.custom.ruleset) {
        const rulesetBreakdown = i.split(",")
        const slug = rulesetBreakdown[0];
        const content = rulesetBreakdown.slice(1).join(",");
        if (content.startsWith("https://") || content.startsWith("http://")) {
            if (!Config.RuleProviders[slug]) {
                Config.RuleProviders[slug] = [];
            }
            Config.RuleProviders[slug].push(content)
        } else {
            if (!Config.Rules[slug]) {
                Config.Rules[slug] = [];
            }
            const postProcessedContent = content
                .split(",").map(i=>i.trim()).join(",")
                .replace(/^\[\]FINAL/i, "MATCH")
                .replace(/^\[\]/g, "")
            Config.Rules[slug].push(postProcessedContent)
        }
    }

    // process proxy groups
    for (let i of RemoteConfig.custom.custom_proxy_group) {
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