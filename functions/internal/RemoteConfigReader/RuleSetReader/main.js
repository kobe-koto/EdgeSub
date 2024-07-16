import { fetchCached } from "../utils/fetchCached.js";

export class RuleSetReader {
    RuleSet = {};
    // for what really supported, plz refer to `this.Reader`
    static ExpectedTypes = ["surge", "quanx", "clash-domain", "clash-ipcidr", "clash-classic"];
    constructor (RuleSet) {
        const [Outbound, ...Args] = RuleSet.split(",");
        this.RuleSet = { Outbound, Args, Rules: [] };
    }
    async Process (CacheDB, isForcedRefresh) {
        const { Outbound, Args, Rules } = this.RuleSet;
        if (Args[0].startsWith("[]")) { // quote a proxy group when starts with `[]`
            Rules.push(Args.join(",").replace(/^\[\]/, ""))
        } else {
            // this.RuleSet.Interval = Args[1]; // we are not using this for now, but it's a reminder #todo

            // get rule type, assume it's surge type when unmatched.
            let RuleType = Args[0].split(":");
            RuleType = !RuleSetReader.ExpectedTypes.includes(RuleType) ? "surge" : RuleType;

            // get rule list
            let RawRuleURL = Args[0].replace(new RegExp(`^${RuleType}:`, ""))
            let RawRule = await fetchCached(RawRuleURL, "RuleSet", CacheDB, isForcedRefresh);

            // process rule list 
            Rules.concat(await this.Parser[RuleType](RawRule))
        }
        return { Outbound, Rules }
    }
    Parser = {
        surge: RawRule => RawRule.replaceAll("\r", "\n").split("\n").filter(i => i && !i.startsWith("#")).map(i => i.trim())
    }
}
