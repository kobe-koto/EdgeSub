export default async function ReadRemoteConfig (
    RemoteConfigURL = "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/special/basic.ini"
) {
    let RawConfig = await fetch (RemoteConfigURL).then(res => res.text()).then(res => res.split("\n").filter(loc => loc))
    let Config = {
        RuleSet: [],
        ProxyGroup: []
    }
    for (let i of RawConfig) {
        let ConfigType = i.split("=")[0];
        if (ConfigType === "ruleset") {
            let Rule = i.split("=")[1];
            let RemoteList = Rule.split(`${Rule.split(",")[0]},`)[1];
            Config.RuleSet.push({
                Outbound: i.split("=")[1].split(",")[0],
                List: 
                    RemoteList.match(/http(s|)\:\/\//i)
                     ? await fetch(i.split("=")[1].split(",")[1])
                            .then(res => {
                                if (res.status === 200 || res.status === 304) {
                                    return res
                                } else {
                                    throw "Failed to get remote config."
                                }
                            })
                            .then(res => res.text())
                            .then(res => res.split("\n").filter(i => !!i && !i.match(/^\#/g)).map(i => i.trim()) )
                            .catch(() => [])
                     : [ RemoteList.replace(/^\[\]/, "") ]
            })
        } else if (ConfigType = "custom_proxy_group") {
            let ConfigArr = i.split("=")[1].split("`");
            Config.ProxyGroup.push({
                name: ConfigArr[0],
                type: ConfigArr[1],
                RegExpArr: ConfigArr.slice(2),
            })
        }
    }
    Config.RuleSet = Config.RuleSet.filter(i => i.List.length > 0)

    return Config;
}
