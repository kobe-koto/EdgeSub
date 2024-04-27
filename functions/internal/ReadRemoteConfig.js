export default async function ReadRemoteConfig (RemoteConfigURL, EdgeSubDB, isForcedRefresh) {
    
    let Config = {
        RuleSet: [],
        ProxyGroup: []
    },
    __timer;

    globalThis.EdgeSubDB = EdgeSubDB;

    console.log(`▶️ [Info] [RemoteConf] Fetching Remote Config at ${RemoteConfigURL}`)
    __timer = (new Date()).getTime();
    let RawConfig = await fetchRemoteConfig(RemoteConfigURL, isForcedRefresh);
    console.log(`▶️ [Info] [RemoteConf] - Fetched, wasting ${(new Date()).getTime() - __timer}ms.`)

    for (let i of RawConfig) {
        let ConfigType = i.split("=")[0];

        if (ConfigType === "ruleset") {
            __timer = (new Date()).getTime()
            let RuleSetURL = i.split("=")[1];
            console.log(`▶️ [Info] [RuleSet   ] Fetching Remote RuleSet at ${RuleSetURL}`)
            let Response = await processRuleSet(RuleSetURL, isForcedRefresh)

            if (Response) {
                console.log(`▶️ [Info] [RuleSet   ] - Fetched, wasting ${(new Date()).getTime() - __timer}ms.`)
                Config.RuleSet.push(Response)
            } else {
                console.log(`⚠️ [Warn] [RuleSet   ] - Fetch failed, wasting ${(new Date()).getTime() - __timer}ms.`)
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

async function fetchRemoteConfig (URL, isForcedRefresh) {
    const RemoteConfigKey = `RemoteConfig_${URL}`;
    let cachedData =
        isForcedRefresh
         ? false
         : await EdgeSubDB.get(RemoteConfigKey, { type: "json" })
    if (!cachedData) { // only when cachedData == falsy
        console.info("▶️ [Info] [RemoteConf] - This one is not cached in kv, what a pity! My times passing away 😭")
        let data = await fetch (URL)
            .then(res => {
                if (res.status === 200 || res.status === 304) {
                    return res
                } else {
                    throw "Failed to get remote config."
                }
            })
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
            .catch(() => false);

        if (data !== false) {
            await EdgeSubDB.put(RemoteConfigKey, JSON.stringify(data), { expirationTtl: ( 6 * 60 * 60 )})
        }
        return data;
    }
    console.info("▶️ [Info] [RemoteConf] - This one is cached in kv, congrats for time saving.")
    return cachedData;
}
async function fetchRemoteRuleSet (URL, isForcedRefresh) {
    const RuleSetKey = `RuleSet_${URL}`;
    let cachedData =
        isForcedRefresh
         ? false
         : await EdgeSubDB.get(RuleSetKey, { type: "json" })
    if (!cachedData) { // only when cachedData == falsy
        console.info("▶️ [Info] [RuleSet   ] - This one is not cached in kv, what a pity! My times passing away 😭")
        let data = await fetch(URL)
            .then(res => {
                if (res.status === 200 || res.status === 304) {
                    return res
                } else {
                    throw "Failed to get remote RuleSet."
                }
            })
            .then(res => res.text())
            .then(res => res.split("\n").filter(i => i && !i.startsWith("#")).map(i => i.trim()))
            .catch(() => false);
        if (data !== false) {
            await EdgeSubDB.put(RuleSetKey, JSON.stringify(data), { expirationTtl: ( 6 * 60 * 60 )})
        }
        return data;
    }
    console.info("▶️ [Info] [RuleSet   ] - This one is cached in kv, congrats for time saving.")
    return cachedData;
}

async function processRuleSet (RuleSet, isForcedRefresh) {
    const Outbound = RuleSet.split(",")[0];
    const RemoteListURL = RuleSet.split(`${Outbound},`)[1];
    let RemoteList = RemoteListURL.match(/^http(s|)\:\/\//i)
         ? await fetchRemoteRuleSet(RemoteListURL, isForcedRefresh)
         : [ RemoteListURL.replace(/^\[\]/, "") ];
    if (RemoteList !== false) {
        return { Outbound, RemoteList }
    }
    return false;
}