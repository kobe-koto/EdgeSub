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




// for transport layers
export type TransportHTTP = {
    method: string;
    path: string[];
    headers?: {
        host?: string
    };
}
export type TransportH2 = {
    method: string;
    path: string;
}
export type TransportGRPC = {
    "grpc-service-name": string;
}
export type TransportWS = {
    path?: string;
    headers?: {
        host?: string
    };
    "max-early-data"?: number;
    "early-data-header-name"?: "Sec-WebSocket-Protocol" | string;
    "v2ray-http-upgrade"?: unknown;
    "v2ray-http-upgrade-fast-open"?: unknown;
}

// for reality
export type RealityConfig = {
    "public-key"?: string;
    "short-id"?: string;
}