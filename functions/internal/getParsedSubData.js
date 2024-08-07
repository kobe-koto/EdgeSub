import { ShareLinkParser } from "./Parsers/share-link";
import { ClashMetaParser } from "./Parsers/clash-meta";

import Yaml from "js-yaml";


/**
 * 
 * @param {String | URL} SubURL 
 * @param {Array} headers 
 * @returns {Array}
 */
export default async function getParsedSubData (SubURLs, headers = []) {
    let timer = (new Date()).getTime();
    console.log("▶️ [Info] Fetching Sub Data...")

    let SubURLArr = SubURLs.split("||").map(i => decodeURIComponent(i));
    let ParsedData = [];
    for (let i in SubURLArr) {
        console.log(`▶️ [Info] Fetching Sub Data ${parseInt(i) + 1} of ${SubURLArr.length}`)
        ParsedData = [...ParsedData, ...await ParseSubData(SubURLArr[i], headers)]
    }

    console.log(`▶️ [Info] Fetching Sub Data done, wasting ${(new Date()).getTime() - timer}ms.`)
    return ParsedData;
}
async function ParseSubData (SubURL, headers = []) {
    let SubData;

    // handle raw share link (assume every string that dont starts with http(s|):// )
    if (!SubURL.match(/^http(s|):\/\//i)) {
        SubData = {
            type: "share-link",
            data: SubURL
        }
    } else {
        SubData = await fetch(SubURL, headers)
            .then(res => res.text())
            .then(res => res.trim())
            .then(res => {
                try {
                    let YamlData = Yaml.load(res);
                    if (YamlData.proxies) {
                        return {
                            type: "clash-meta",
                            data: YamlData
                        }
                    }
                } catch (e) {}

                try {
                    let decodedData = atob(res.trim());
                    if (!decodedData.match(/\:\/\//gi)) {
                        throw "seems like malformed base64 decoded data, return raw data."
                    }
                    return {
                        type: "share-link",
                        data: decodedData
                    }
                } catch (e) {}

                return {
                    type: "share-link",
                    data: res
                }
            });
    }

    let ParsedSubData = [];
    if (SubData.type === "share-link") {
        let links = SubData.data.replaceAll("\r", "\n").split("\n").filter(loc => !!loc);
        for (let i of links) {
            let protocol = i.split(":")[0];
            let Parser = new ShareLinkParser()
            if (Parser[protocol]) {
                ParsedSubData.push(Parser[protocol](i))
            } else {
                console.log(`${protocol} is not supported in share-link parser.`)
            }
        }
    } else if (SubData.type === "clash-meta") {
        let { proxies } = SubData.data;
        let Parser = new ClashMetaParser();
        for (let i of proxies) {
            if (Parser[i.type]) {
                ParsedSubData.push(Parser[i.type](i))
            } else {
                console.log(`${i.type} is not supported in clash-meta parser.`)
            }
        }
    }
    
    return ParsedSubData;
}