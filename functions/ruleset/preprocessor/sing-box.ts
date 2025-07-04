import { fetchCached } from "../../internal/utils/fetchCached.js";
import { MetaToSingRuleMapping } from "functions/internal/data/rule/MetaToSingMapping.js";

export async function onRequest (context) {
    const { request } = context;
    const URLObject = new URL(request.url);

    const targetURL = URLObject.searchParams.get("target") as unknown as URL;
    const isForcedRefresh = URLObject.searchParams.get("forced_refresh") === "true" ? true : false;

    if (!targetURL) {
        return new Response("400 Bad Request. 'targetURL' required.", {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            }
        })
    }


    let RawData = await fetchCached(targetURL, "RuleSet", context.env.EdgeSubDB, isForcedRefresh);

    let RulesList = RawData.split("\n").map(i => i.trim()).filter(i => i.length > 0 && !i.startsWith("#")).map(i => i.split(",").map(j => j.trim()));

    // merge up rules
    let rules = {}; // ref: https://sing-box.sagernet.org/configuration/rule-set/headless-rule/
    for (let i of RulesList) {
        const type = MetaToSingRuleMapping[i[0]],
              payload = i[1];
        if (!type) {
            continue
        }
        if (!(type in rules)) {
            rules[type] = [];
        }
        rules[type].push(payload);
    }


    return new Response(JSON.stringify({ "version": 1, rules: [ rules ] }), {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": RawData.length
        }
    })
}
