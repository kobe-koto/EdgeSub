let Config = {
    RuleSet: [],
    ProxyGroup: []
}

export default async function ReadRemoteConfig (
    RemoteConfigURL = "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/special/basic.ini"
) {
    console.log(`[Info] [RemoteConf] Fetching Remote Config at ${RemoteConfigURL}`)
    let RawConfig = await fetchRemoteConfig(RemoteConfigURL);
    for (let i of RawConfig) {
        let ConfigType = i.split("=")[0];

        if (ConfigType === "ruleset") {
            let RuleSetURL = i.split("=")[1];
            console.log(`[Info] [RuleSet] Fetching Remote RuleSet at ${RuleSetURL}`)
            let Response = await processRuleSet(RuleSetURL)

            if (Response) {
                console.log("[Info] [RuleSet] Fetch Remote RuleSet done")
                Config.RuleSet.push(Response)
            } else {
                console.log("[Warn] [RuleSet] Fetch Remote RuleSet failed")
            }
        } else if (ConfigType === "custom_proxy_group") {
            let ConfigArr = i.split("=")[1].split("`");
            Config.ProxyGroup.push({
                name: ConfigArr[0],
                type: ConfigArr[1],
                RegExpArr: ConfigArr.slice(2).filter(t => !t.startsWith("[]")),
                GroupSelectors: ConfigArr.slice(2).filter(t => t.startsWith("[]")),
            })
        }
    }

    return Config;
}

async function fetchRemoteConfig (URL) {
    return await fetch (URL)
        .then(res => res.text())
        .then(res => 
            res.split("\n")
                .filter( loc => 
                    !(
                        loc.startsWith(";")
                        || ( loc.startsWith("[") && loc.endsWith("]") )
                    )
                    && loc 
                )
            )
}
async function fetchRemoteRuleSet (URL) {
    return await fetch(URL)
        .then(res => {
            if (res.status === 200 || res.status === 304) {
                return res
            } else {
                throw "Failed to get remote config."
            }
        })
        .then(res => res.text())
        .then(res => res.split("\n").filter(i => i && !i.startsWith("#")).map(i => i.trim()))
        .catch(() => false)
}

async function processRuleSet (RuleSet) {
    const Outbound = RuleSet.split(",")[0];
    const RemoteListURL = RuleSet.split(`${Outbound},`)[1];
    let RemoteList = 
        RemoteListURL.match(/^http(s|)\:\/\//i)
         ? await fetchRemoteRuleSet(RemoteListURL)
         : [ RemoteListURL.replace(/^\[\]/, "") ];
    return { Outbound, RemoteList }
}