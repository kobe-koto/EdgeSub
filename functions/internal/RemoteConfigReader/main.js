import { ini } from "./Readers/ini.js"

export class RemoteConfigReader {
    RemoteConfig = {};
    Reader = {
        ini,
    }
    constructor (RemoteConfigURL) {
        this.RemoteConfig.URL = RemoteConfigURL;
        this.RemoteConfig.Type = RemoteConfigURL.split(".").slice(-1)[0].toLowerCase();

        console.log(`Inputed remote config type: ${this.RemoteConfig.Type}`);

        if (this.RemoteConfig.Type in this.Reader) {
            console.log("Inputed remote config type supported, ready to process")
            return true;
        } else {
            console.warn("Inputed remote config type not supported, skipping.");
            return false;
        }
    }

    Process = async function (EdgeSubDB, isForcedRefresh) {
        return this.Reader[this.RemoteConfig.Type](this.RemoteConfig.URL, EdgeSubDB, isForcedRefresh);
        //let RawConfig = await fetchRemoteConfig(RemoteConfigURL, isForcedRefresh);
    }

}
