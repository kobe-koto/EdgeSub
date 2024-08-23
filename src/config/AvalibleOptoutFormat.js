import { readdirSync } from "node:fs";

const AvalibleEndpoints = [
    {
        key: "Sing Box",
        value: "/sub/sing-box"
    },
    {
        key: "Clash Meta",
        value: "/sub/clash-meta"
    },
    {
        key: "Clash",
        value: "/sub/clash"
    },
    {
        key: "Base 64",
        value: "/sub/base64"
    },
    {
        key: "Share Link 集合",
        value: "/sub/share-link"
    }
]
const AvalibleEndpointsPath = AvalibleEndpoints.map(i => i.value);

const TestingEndpointsPath = readdirSync("./functions/sub/").map(i => `/sub/${i.replace(/\.js$/, "")}`).filter(i => !AvalibleEndpointsPath.includes(i));
let TestingEndpoints = [];
for (let i of TestingEndpointsPath) {
    TestingEndpoints.push({
        key: `${i} (Experimental)`,
        value: i
    })
}

export const Endpoints = [...AvalibleEndpoints, ...TestingEndpoints]
