import { ini } from "./Readers/ini.js"

export class RuleProviderReader {
    RuleProvider = {};
    Reader = {
        ini,
    }
    constructor (RuleProviderURL) {
        this.RuleProvider.URL = RuleProviderURL;
        const pathname = new URL(RuleProviderURL).pathname;
        this.RuleProvider.Type = pathname.split(".").slice(-1)[0].toLowerCase();

        console.info(`[Remote Config Reader] Inputed remote config type: ${this.RuleProvider.Type}`);

        if (this.RuleProvider.Type in this.Reader) {
            return true;
        } else {
            console.warn("[Remote Config Reader] [WARN] Inputed remote config type cannot be detected, assume as .ini.");
            this.RuleProvider.Type = "ini"
            return true;
        }
    }

    Process = async function (EdgeSubDB, isForcedRefresh) {
        let __startTime = performance.now();
        console.info(`[Remote Config Reader] started`);
        const response = this.Reader[this.RuleProvider.Type](this.RuleProvider.URL, EdgeSubDB, isForcedRefresh);
        //let RawConfig = await fetchRuleProvider(RuleProviderURL, isForcedRefresh);
        console.info(`[Remote Config Reader] done, wasting ${performance.now() - __startTime}ms`);
        return response
    }

}
