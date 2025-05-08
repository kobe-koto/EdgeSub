import type { ClashMetaConfig } from "./types/ClashMetaConfig";

import { DefaultRequestHeaders } from "./configs";

import { ShareLinkParser } from "./Parsers/share-link";
import { ClashMetaParser } from "./Parsers/clash-meta";
import { SingBoxParser } from "./Parsers/sing-box";

import Yaml from "js-yaml";
import { TrulyAssign } from "./utils/TrulyAssign";

type SubURL = string; // start with `short:`, `http(s)://`, or sth like `[proxy protocol]://`
type SubURLs = string; // contains SubURL a lot
type SubURLArr = SubURL[]; // usually it is some SubURLs squeeze into a Array.

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
    let ParsedData = [];
    for (let i in SubURLArr) {
        console.info(`[Fetch Sub Data] Fetching ${parseInt(i) + 1}/${SubURLArr.length}`)
        ParsedData = [...ParsedData, ...(await ParseSubData(SubURLArr[i], EdgeSubDB, RequestHeaders))]
    }

    if (isShowHost === true) {
        ParsedData = ParsedData.map(i => {
            i.__Remark = `${i.__Remark} - ${i.Hostname}:${i.Port}`
            return i;
        })
    }

    console.info(`[Fetch Sub Data] Job done, wasting ${performance.now() - __startTime}ms.`)
    return ParsedData;
}
async function ParseSubData (SubURL: SubURL, EdgeSubDB, RequestHeaders) {
    // handle `short` here
    if (SubURL.match(/^short:/i)) {
        let ShortData: SubURLs = await EdgeSubDB.get(SubURL).then(res => JSON.parse(res).subdata);
        console.info(`[Fetch Sub Data] starting sub task for ${SubURL}`)
        let ParsedShortData = await getParsedSubData(ShortData, EdgeSubDB, RequestHeaders);
        console.info(`[Fetch Sub Data] sub task for ${SubURL} done`)
        return ParsedShortData;
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
            .then(async res => await res.text())
            .then(res => {
                // try decode as yaml, for clash-meta config
                try {
                    let YamlData = Yaml.load(res) as ClashMetaConfig;
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
                    let SingBoxConfig = JSON.parse(res);
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
                    let decodedData = atob(res.trim());
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
                    data: res
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
    
    return ParsedSubData;
}