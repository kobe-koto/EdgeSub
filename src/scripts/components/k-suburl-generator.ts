import type { Form } from "@scripts/components/k-form";
import type { EndpointExtendConfigPrototype, EndpointPrototype } from "@config/AvalibleOptoutFormat";
class SubURLGenerator extends HTMLElement {
    TargetExtendConfig: ( "RemoteConfig" | "isUDP" )[];
    Endpoints: EndpointPrototype[] = JSON.parse(this.dataset.endpoints);
    defaultBackend = __getDefaultBackend();
    constructor () {
        super()
        this.GenerateButton.addEventListener("click", () => {this.CheckAndGenerate()});
        this.CopyButton.addEventListener("click", () => {this.CopyURL()});
        this.BasicConfigElement.Endpoint.querySelector("k-dropdown").addEventListener("DropdownSelect", (event: CustomEvent) => {this.ChangeEndpoint(event)});
        document.body.dataset.defaultBackend = this.defaultBackend;
        customElements.whenDefined("k-form").then(() => {
            this.BasicConfigElement.Backend.setDetail(`${this.BasicConfigElement.Backend.getDetail()} (${this.defaultBackend})`);
            console.info("[k-sub-url-generator] k-form registration detected, default backend modified")
        })
    }
    GenerateButton = this.querySelector("button#generate") as HTMLButtonElement;
    CopyButton = this.querySelector("button#copy") as HTMLButtonElement;
    MsgBlock = this.querySelector("code") as HTMLElement;
    BasicConfigElement = {
        SubURL: this.querySelector("k-form#SubURL") as Form,
        Backend: this.querySelector("k-form#Backend") as Form,
        Endpoint: this.querySelector("k-form#Endpoint") as Form,
        isShowHost: this.querySelector("k-form#isShowHost") as Form,
    }
    ExtendConfigElement = {
        RemoteConfigUserspec: this.querySelector("k-form#RemoteConfigUserspec") as Form,
        RemoteConfig: this.querySelector("k-form#RemoteConfig") as Form,
        isUDP: this.querySelector("k-form#isUDP") as Form,
        ForcedWS0RTT: this.querySelector("k-form#ForcedWS0RTT") as Form,
    }
    GetEndpoint (EndpointPath: string = this.BasicConfigElement.Endpoint.get()) {
        for (let i of this.Endpoints) {
            if (i.value === EndpointPath) {
                return i as EndpointPrototype;
            }
        }
        throw `no targeted endpoint found, expected value ${EndpointPath}`
    }
    ChangeEndpoint (event: CustomEvent) {
        const SelectedEndpointPath: string = event.detail.selectedValue;
        let Endpoint: EndpointPrototype = this.GetEndpoint(SelectedEndpointPath);
        let NeededExtendConfig = Endpoint.ExtendConfig || [];

        for (let i in this.ExtendConfigElement) {
            if (NeededExtendConfig.includes(i as EndpointExtendConfigPrototype)) {
                this.ExtendConfigElement[i].style.removeProperty("display")
            } else {
                this.ExtendConfigElement[i].style.setProperty("display", "none")
            }
        }
    }
    CheckAndGenerate () {
        const BasicConfig = {
            SubURL: this.BasicConfigElement.SubURL.get(),
            Backend: this.BasicConfigElement.Backend.get() || this.defaultBackend,
            Endpoint: this.BasicConfigElement.Endpoint.get(),
            isShowHost: this.BasicConfigElement.isShowHost.get()
        }
        const ExtendConfig = {
            RemoteConfig: this.ExtendConfigElement.RemoteConfigUserspec.get() || this.ExtendConfigElement.RemoteConfig.get(),
            isUDP: this.ExtendConfigElement.isUDP.get(),
            ForcedWS0RTT: this.ExtendConfigElement.ForcedWS0RTT.get()
        }
        const NeededExtendConfig = this.GetEndpoint().ExtendConfig || [];
        let Config = { ...BasicConfig }
        for (let i of NeededExtendConfig) {
            if (i in ExtendConfig) {
                Config[i] = ExtendConfig[i];
            } else {
                console.warn(`[Merge Config] ${i} required but not found in ExtendConfig.`)
            }
        }
        

        let ErrorState = false;
        for (let i in Config) {
            if (
                ( typeof Config[i] === "string" && Config[i].length === 0 )
            ) {
                alert(`${i} can't be empty`);
                ErrorState = true;
                continue;
            }
        }
        if (ErrorState === true) {
            return;
        }

        this.MsgBlock.innerText = this.GenerateSubURL(Config);

    }

    GenerateSubURL (Config: { SubURL: any; Backend: any; Endpoint: any; RemoteConfig?: any; isUDP?: any; ForcedWS0RTT?: any; isShowHost: any }) {
        let URLObj = new URL(Config.Backend);
        URLObj.pathname = Config.Endpoint;
        URLObj.search = "";
        URLObj.hash = "";

        URLObj.searchParams.append("url", Config.SubURL)
        Config.RemoteConfig && URLObj.searchParams.append("remote_config", Config.RemoteConfig)
        Config.isUDP && URLObj.searchParams.append("udp", Config.isUDP.toString())
        Config.isShowHost && URLObj.searchParams.append("show_host", Config.isShowHost.toString())
        Config.ForcedWS0RTT && URLObj.searchParams.append("forced_ws0rtt", Config.ForcedWS0RTT.toString())
        return URLObj.toString();
    }
    CopyURL () {
        if (!navigator.clipboard) {
            alert("navigator.clipboard API not found on your drowser")
            return;
        }
        let URLtoCopy = this.MsgBlock.innerText;
        navigator.clipboard.writeText(URLtoCopy).then( () => {
            alert("已将连接复制到剪贴板");
        }).catch(function(err) {
            alert(`err: ${err}`);
        });
    }
}

customElements.define("k-suburl-generator", SubURLGenerator)
console.info("[k-suburl-generator] registered")

function __getDefaultBackend () {
    let URLObj = new URL(location.href);
    URLObj.pathname = "/";
    URLObj.search = "";
    URLObj.hash = "";

    return URLObj.host === "localhost:4321" ? "http://localhost:8788/" : URLObj.toString();
}
