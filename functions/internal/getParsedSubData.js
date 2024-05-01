import NodeParser from "./NodeParser";
let Parser = new NodeParser()

/**
 * 
 * @param {String | URL} SubURL 
 * @param {Array} headers 
 * @returns {Array}
 */
let timer = (new Date()).getTime();
export default async function getParsedSubData (SubURL, headers = []) {
    console.log("▶️ [Info] Fetching Sub Data...")
    let SubData = await fetch(SubURL, headers)
        .then(res => res.text())
        .then(res => res.trim())
        .then(res => {
            let decodedData;
            try {
                decodedData = atob(res);
                if (!decodedData.match(/\:\/\//gi)) {
                    throw "seems like malformed base64 decoded data, return raw data."
                }
                return decodedData;
            } catch (err) {
                return res;
            }
        })
        .then(res => res.split("\n"))
        .then(res => {
            let t = [];
            for (let i of res) {
                if (i) {
                    t.push(i);
                }
            }
            return t;
        });

    let ParsedSubData = [];
    for (let i of SubData) {
        let protocol = i.split(":")[0];
        if (Parser[protocol]) {
            ParsedSubData.push(Parser[protocol](i))
        } else {
            console.log(`${protocol} is not supported.`)
        }
    }
    console.log(`▶️ [Info] Fetching Sub Data done, wasting ${(new Date()).getTime() - timer}ms.`)
    return ParsedSubData;
}