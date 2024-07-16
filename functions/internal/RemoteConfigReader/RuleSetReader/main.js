import { fetchCached } from "../utils/fetchCached.js";

export class RuleSetReader {
    RuleSet = {};
    // for what really supported, plz refer to `this.Reader`
    ExpectedTypes = ["surge", "quanx", "clash-domain", "clash-ipcidr", "clash-classic"];
    constructor (RuleSet) {
        let RawRuleSet = RuleSet.split(",");
        this.RuleSet.Outbound = RawRuleSet[0];
        this.RuleSet.Args = RawRuleSet.slice(1);
    }
    async Process (CacheDB, isForcedRefresh) {
        this.RuleSet.Rules = [];
        if (this.RuleSet.Args[0].startsWith("[]")) {
            this.RuleSet.Rules.push(this.RuleSet.Args.join(",").replace(/^\[\]/, ""))
        } else {
            // this.RuleSet.Interval = this.RuleSet.Args[1]; // we are not using this for now, but it's a reminder #todo
            let RuleType = this.RuleSet.Args[0].split(":");
            if (!this.ExpectedTypes.includes(RuleType)) { // assume it's surge type when unmatched.
                RuleType = "surge";
            }
            let RemoteListURL = this.RuleSet.Args[0].replace(new RegExp(`^${RuleType}:`, ""))

            this.RuleSet.Rules = await this.Reader[RuleType](RemoteListURL, CacheDB, isForcedRefresh)
        }
        return { Outbound: this.RuleSet.Outbound, Rules: this.RuleSet.Rules }
    }
    Reader = {
        surge: async function (RemoteListURL, CacheDB, isForcedRefresh) {
            let RemoteList = 
                await fetchCached(RemoteListURL, "RuleSet", CacheDB, isForcedRefresh)
                .then(res => res.replaceAll("\r", "\n").split("\n").filter(i => i && !i.startsWith("#")).map(i => i.trim()))
            if (RemoteList) {
                return RemoteList;
            } else {
                return [];
            }
        }
    }
}
