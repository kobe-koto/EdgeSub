import { stringify as INIStringify , parse as INIParse } from "ini";

import { fetchCached } from "../utils/fetchCached.js";
import { RuleSetReader } from "../RuleSetReader/main.js";

export async function ini (RemoteConfigURL, CacheDB, isForcedRefresh) {

    let Config = {
        RuleSet: [],
        ProxyGroup: []
    };

    // get raw remote config.
    let RemoteConfig = 
        await fetchCached(RemoteConfigURL, "RemoteConfig", CacheDB, isForcedRefresh)
        .then(res => {
            let PreProcessed = res;
            PreProcessed = PreProcessed.replaceAll("ruleset=", "ruleset[]=")
            PreProcessed = PreProcessed.replaceAll("custom_proxy_group=", "custom_proxy_group[]=")
            return PreProcessed;
        })
        .then(res => INIParse(res));


    // process rulesets
    for (let i of RemoteConfig.custom.ruleset) {
        let NowRuleSetReader = new RuleSetReader(i);
        Config.RuleSet.push(await NowRuleSetReader.Process(CacheDB, isForcedRefresh))
    }

    // process proxy groups
    for (let i of RemoteConfig.custom.custom_proxy_group) {
        // we dont support these "特殊筛选条件", sorry. #todo
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