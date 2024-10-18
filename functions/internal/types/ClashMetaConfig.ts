// reference: https://wiki.metacubex.one/

type ClashMetaProxyGroup = {
    name: string;
    type: string; // head to https://wiki.metacubex.one/config/proxy-groups/
    url?: string | URL;
    interval?: number;
    tolerance?: number;
    proxies: string[]
}

export type ClashMetaConfig = {
    port: number;
    "socks-port": number;
    "allow-lan": boolean;
    mode: "Rule" | "Global" | "Direct";
    "log-level": "silent" | "error" | "warning" | "info" | "debug";
    "external-controller": string; // start with ":"
    ipv6: boolean; // default true
    dns: {
        enabled: boolean; // default true
        nameserver: string[];
        fallback: string[];
    };
    proxies: []
    "proxy-groups": ClashMetaProxyGroup[];
    rules: string[] // head to https://wiki.metacubex.one/config/rules/
}

