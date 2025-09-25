export type headlessRuleSet = {
    type: "remote",
    tag: string,
    url: string,
    format: "binary" | "source",
}


export function transformGeoRef (
    type: string, 
    payload: string, 
    EdgeSubInstanceBaseURL
): { 
    headlessRule: any, 
    headlessRuleSet: headlessRuleSet | null
} {
    const RuleSetTag = `${type}-${payload.toLowerCase()}`;

    if (RuleSetTag === "geoip-lan") {
        return {
            headlessRule: {
                ip_is_private: true,
        
            },
            headlessRuleSet: null
        }
    }

    // let edge-sub preprocess the rule-set
    // construct url
        let RuleSetURLObject = new URL(EdgeSubInstanceBaseURL);
            RuleSetURLObject.pathname = "/ruleset/proxy";
            RuleSetURLObject.search = "";
            RuleSetURLObject.searchParams.append("target", `https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/${RuleSetTag}.srs`);
    const RuleSetURL = RuleSetURLObject.toString();

    return {
        headlessRule: {
            rule_set: RuleSetTag,
        },
        headlessRuleSet: {
            type: "remote",
            tag: RuleSetTag,
            format: "binary",
            url: RuleSetURL,
        }
    }
}