import { ini } from "./Readers/ini.js"

export class RemoteConfigReader {
    RemoteConfig = {};
    Reader = {
        ini,
    }
    constructor (RemoteConfigURL) {
        this.RemoteConfig.URL = RemoteConfigURL;
        this.RemoteConfig.Type = RemoteConfigURL.split(".").slice(-1)[0].toLowerCase();

        console.info(`[Remote Config Reader] Inputed remote config type: ${this.RemoteConfig.Type}`);

        if (this.RemoteConfig.Type in this.Reader) {
            return true;
        } else {
            console.warn("[Remote Config Reader] [WARN] Inputed remote config type not supported, skipping.");
            return false;
        }
    }

    Process = async function (EdgeSubDB, isForcedRefresh) {
        let __startTime = performance.now();
        console.info(`[Remote Config Reader] started`);
        const response = this.Reader[this.RemoteConfig.Type](this.RemoteConfig.URL, EdgeSubDB, isForcedRefresh);
        //let RawConfig = await fetchRemoteConfig(RemoteConfigURL, isForcedRefresh);
        console.info(`[Remote Config Reader] done, wasting ${performance.now() - __startTime}ms`);
        return response
    }

}
