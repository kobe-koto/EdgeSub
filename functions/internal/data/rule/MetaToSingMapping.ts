// mihomo src rule syntax
// <TYPE>, <PAYLOAD>, <OUTBOUND>, <Additional Parameters>
// note: headless rule doesnt need to care bout outbound
//       additional parameters is not handled by sing-box/route/rule:
//       - "no-resolve"'s sing-box/dns/rule's work. 
//       - "src" is a crazy thing i don't even know why it exists (
export const MetaToSingRuleMapping = {
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

    "UID": "user_id",

    "IN_NAME": "inbound",

    "Sing_PROTOCOL": "protocol",


    "AND": "and",
    "OR": "or",
    // "NOT": "invert", // #TBD: invert rules
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
