import { fetchCached } from "../../internal/utils/fetchCached.js";

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
        const type = Mapping[i[0]],
              payload = i[1];
        if (!(type in rules)) {
            rules[type] = [];
        }
        rules[type].push(payload);
    }


    return new Response(JSON.stringify({rules}), {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Length": RawData.length
        }
    })
}

// mihomo src rule syntax
// <TYPE>, <PAYLOAD>, <OUTBOUND>, <Additional Parameters>
// note: headless rule doesnt need to care bout outbound
//       additional parameters is not handled by sing-box/route/rule:
//       - "no-resolve"'s sing-box/dns/rule's work. 
//       - "src" is a crazy thing i don't even know why it exists (

// Mapping rules, mihomo -> sing-box
const Mapping = {
    "DOMAIN": "domain",
    "DOMAIN-SUFFIX": "domain_suffix",
    "DOMAIN-KEYWORD": "domain_keyword",
    "DOMAIN-REGEX": "domain_regex",

    "GEOSITE": "geosite",
    "GEOIP": "geoip",

    "IP-CIDR": "ip_cidr",
    "IP-CIDR6": "ip_cidr", // IP-CIDR6 is a alias for IP-CIDR in mihomo route rule
    "SRC-IP-CIDR": "source_ip_cidr",
    "SRC-PORT": "source_port",

    "DST-PORT": "port",

    "PROCESS-PATH": "process_path",
    "PROCESS-PATH-REGEX": "process_path_regex",
    "PROCESS-NAME": "process_name",

    "NETWORK": "network",


    // "AND": "and",
    // "OR": "or",
    // "NOT": "not",

    // TBD: LOGIC RULES

}


// mihomo source route rule w/o matching or no need to convert

// IP-SUFFIX IP-ASN // destination IP rules
// SRC-GEOIP SRC-IP-ASN SRC-IP-SUFFIX // source IP rules
// IN-PORT IN-TYPE IN-USER IN-NAME // inbound rules
// PROCESS-NAME-REGEX
// UID
// DSCP

// RULE-SET
// SUB-RULE
// MATCH