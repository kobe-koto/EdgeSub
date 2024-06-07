import { ShareLinkParser } from "./Parsers/share-link";

/**
 * 
 * @param {String | URL} SubURL 
 * @param {Array} headers 
 * @returns {Array}
 */
export default async function getParsedSubData (SubURL, headers = []) {
    let timer = (new Date()).getTime();
    console.log("▶️ [Info] Fetching Sub Data...")
    let SubData = await fetch(SubURL, headers)
        .then(res => res.text())
        .then(res => res.trim())
        .then(res => {
            try {
            try {
                let decodedData = atob(res);
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

    let ParsedSubData = [];
    if (SubData.type === "share-link") {
        let links = SubData.data.split("\n").filter(loc => !!loc);
        for (let i of links) {
            let protocol = i.split(":")[0];
            let Parser = new ShareLinkParser()
            if (Parser[protocol]) {
                ParsedSubData.push(Parser[protocol](i))
            } else {
                console.log(`${protocol} is not supported in share-link parser.`)
            }
        }
    }
        }
    }
    
    console.log(`▶️ [Info] Fetching Sub Data done, wasting ${(new Date()).getTime() - timer}ms.`)
    return ParsedSubData;
}