import NodeParser from "./NodeParser";
let Parser = new NodeParser()

/**
 * 
 * @param {String | URL} SubURL 
 * @param {Array} headers 
 * @returns {Array}
 */
export default async function getParsedSubData (SubURL, headers = []) {
    let SubData = await fetch(SubURL, headers)
        .then(res => res.text())
        .then(res => {
            if (!res.match(/(\/|\:|\?\#)/gi)) { // seems like base64 encoded data, gonna to decode it here.
                try {
                    return atob(res)
                } catch (err) {
                    // decode error, no handles here
                }
            }
            return res;
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
    return ParsedSubData;
}