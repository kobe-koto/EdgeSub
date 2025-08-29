import type { ClashMetaConfig } from "./types/ClashMetaConfig";

import { DefaultRequestHeaders } from "./configs";

import { ShareLinkParser } from "./Parsers/share-link";
import { ClashMetaParser } from "./Parsers/clash-meta";
import { SingBoxParser } from "./Parsers/sing-box";

import Yaml from "js-yaml";
import { TrulyAssign } from "./utils/TrulyAssign";
import { parseContentDisposition } from "./utils/parseContentDisposition";

type SubURL = string; // start with `short:`, `http(s)://`, or sth like `[proxy protocol]://`
type SubURLs = string; // contains SubURL a lot
type SubURLArr = SubURL[]; // usually it is some SubURLs squeeze into a Array.
type ParsedSubscription = {
    data: any[];
    SubscriptionUserInfo?: SubscriptionUserInfo;
};
type SubscriptionUserInfo = {
    traffic?: string; // e.g. 'upload=<bytes>; download=<bytes>; total=<bytes>; expire=<timestamp>', from `subscription-userinfo` header
    name?: string; // e.g. 'Nexitally', from `content-disposition` header filename field.
}

/**
 * 
 * @returns {Array}
 */
export default async function getParsedSubData (
    SubURLs: SubURLs, 
    EdgeSubDB, 
    isShowHost = false as boolean,
    CustomHTTPHeaders = {} as Headers
) {
    let __startTime = performance.now();
    console.info("[Fetch Sub Data] Job started")
    console.info(`[Fetch Sub Data] isShowHost: ${isShowHost.toString()}`)

    const RequestHeaders = TrulyAssign(DefaultRequestHeaders, CustomHTTPHeaders);

    let SubURLArr = SubURLs.replaceAll("\r", "\n").split("\n").filter((i) => !!i).map(i => encodeURIComponent(i.trim())).map(i => decodeURIComponent(i)) as SubURLArr;
    let Proxies = [],
        SubscriptionUserInfos: SubscriptionUserInfo[] = [];
    for (let i in SubURLArr) {
        console.info(`[Fetch Sub Data] Fetching ${parseInt(i) + 1}/${SubURLArr.length}`)
        const ParsedSubscription = await ParseSubData(SubURLArr[i], EdgeSubDB, RequestHeaders);
        Proxies = [...Proxies, ...ParsedSubscription.data];
        if (ParsedSubscription.SubscriptionUserInfo) {
            SubscriptionUserInfos.push(ParsedSubscription.SubscriptionUserInfo);
        }
    }

    if (isShowHost === true) {
        Proxies = Proxies.map(i => {
            i.__Remark = `${i.__Remark} - ${i.Hostname}:${i.Port}`
            return i;
        })
    }

    console.info(`[Fetch Sub Data] Job done, wasting ${performance.now() - __startTime}ms.`)
    return {Proxies, SubscriptionUserInfos};
}
async function ParseSubData (SubURL: SubURL, EdgeSubDB, RequestHeaders) : Promise<ParsedSubscription> {

    // pre define SubscriptionUserInfo
    let SubscriptionUserInfo: SubscriptionUserInfo;

    // handle `short` here
    if (SubURL.match(/^short:/i)) {
        let ShortData: SubURLs = await EdgeSubDB.get(SubURL).then(res => JSON.parse(res).subdata);
        console.info(`[Fetch Sub Data] starting sub task for ${SubURL}`)
        let ParsedShortData = (await getParsedSubData(ShortData, EdgeSubDB, RequestHeaders)).Proxies;
        console.info(`[Fetch Sub Data] sub task for ${SubURL} done`)
        return { data: ParsedShortData };
    }

    let SubData;
    // handle bundle share link (not starts with `http(s|)://` )
    if (!SubURL.match(/^http(s|):\/\//i)) {
        SubData = {
            type: "share-link",
            data: SubURL
        }
    } else {
        SubData = await fetch(SubURL, { headers: RequestHeaders })
            .then(async res => { 
                console.info(`[Fetch Sub Data] Response status code ${res.status}`);
                return {
                    data: await res.text(),
                    headers: res.headers
                }
            })
            .then(res => {
                // fill out SubscriptionUserInfo
                SubscriptionUserInfo = {
                    traffic: res.headers.has("Subscription-UserInfo") ? res.headers.get("Subscription-UserInfo") : null,
                    name: res.headers.has("Content-Disposition") ? parseContentDisposition(res.headers.get("Content-Disposition")) : null
                };
                // try decode as yaml, for clash-meta config
                try {
                    let YamlData = Yaml.load(res.data) as ClashMetaConfig;
                    if (YamlData.proxies) {
                        return {
                            type: "clash-meta",
                            data: YamlData
                        }
                    }
                } catch (e) {
                    console.warn(`[Fetch Sub Data] Err when try parse as yaml: ${e}, skipping...`)
                }
                // try decode as json, for sing-box config
                try {
                    let SingBoxConfig = JSON.parse(res.data);
                    if (SingBoxConfig.outbounds) {
                        return {
                            type: "sing-box",
                            data: SingBoxConfig
                        }
                    }
                } catch (e) {
                    console.warn(`[Fetch Sub Data] Err when try parse as JSON (sing-box): ${e}, skipping...`)
                }

                // try decode as base64 endoded share-links
                try {
                    let decodedData = atob(res.data.trim());
                    if (!decodedData.match(/\:\/\//gi)) {
                        throw "seems like base64 decoded data malformed"
                    }
                    return {
                        type: "share-link",
                        data: decodedData
                    }
                } catch (e) {
                    console.warn(`[Fetch Sub Data] try parse as base64: ${e}, skipping...`)
                }

                // final return as share-link
                return {
                    type: "share-link",
                    data: res.data
                }
            })
    }

    let ParsedSubData = [];
    if (SubData.type === "share-link") {
        let links = SubData.data.replaceAll("\r", "\n").split("\n").filter(loc => !!loc);
        let Parser = new ShareLinkParser();
        for (let i of links) {
            let protocol = i.split(":")[0];
            try {
                if (Parser.__validate(i)) {
                    ParsedSubData.push(Parser[protocol](i))
                }
            } catch (e) {
                console.warn(`[Fetch Sub Data] this share-url doesn't seem right, ignoring... ('${i}')`)
                console.warn(e)
            }
        }
    } else if (SubData.type === "clash-meta") {
        let { proxies } = SubData.data;
        let Parser = new ClashMetaParser();
        for (let i of proxies) {
            if (Parser.__validate(i)) {
                ParsedSubData.push(Parser[i.type](i))
            }
        }
    } else if (SubData.type === "sing-box") {
        let { outbounds } = SubData.data;
        let Parser = new SingBoxParser();
        for (let i of outbounds) {
            if (Parser.__validate(i)) {
                ParsedSubData.push(Parser[i.type](i))
            }
        }
    }
    
    return {
        data: ParsedSubData,
        SubscriptionUserInfo,
    };
}