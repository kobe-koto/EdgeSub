import type { DataInput } from "@scripts/components/data-input";
import type { EndpointExtendConfigPrototype, EndpointPrototype } from "@config/AvalibleOptoutFormat";
import { getDefaultBackend } from "@scripts/utils/getDefaultBackend";

class SubURLGenerator extends HTMLElement {
    TargetExtendConfig: ( "RuleProvider" | "isUDP" )[];
    Endpoints: EndpointPrototype[] = JSON.parse(this.dataset.endpoints);
    defaultBackend = getDefaultBackend();

    constructor () {
        super()
        
        this.setupEventListeners();

        customElements.whenDefined("data-input").then(() => {
            this.Elements.Config.Basic.Backend.setDetail(`${this.Elements.Config.Basic.Backend.getDetail()} (${this.defaultBackend})`);
            console.info("[k-sub-url-generator] data-input registration detected, default backend modified")
        })
    }


    private setupEventListeners () {
        this.Elements.Action.Generate.addEventListener("click", () => {this.CheckAndGenerate()});
        this.Elements.Action.Copy.addEventListener("click", () => {this.CopyURL()});
        this.Elements.Config.Basic.Endpoint.addEventListener("change", (event: CustomEvent) => {this.ChangeEndpoint(event)});
    }

    private Elements = {
        Action: {
            Generate: this.querySelector("button#generate") as HTMLButtonElement,
            Copy: this.querySelector("button#copy") as HTMLButtonElement,
            MsgBlock: this.querySelector("code") as HTMLElement,
        },
        Config: {
            Basic: {
                SubURL: this.querySelector("data-input#SubURL") as DataInput,
                Backend: this.querySelector("data-input#Backend") as DataInput,
                Endpoint: this.querySelector("data-input#Endpoint") as DataInput,
                isShowHost: this.querySelector("data-input#isShowHost") as DataInput,
                HTTPHeaders: this.querySelector("data-input#HTTPHeaders") as DataInput,
            },
            Extended: {
                RuleProviderUserspec: this.querySelector("data-input#RuleProviderUserspec") as DataInput,
                RuleProvider: this.querySelector("data-input#RuleProvider") as DataInput,
                ProxyRuleProviders: this.querySelector("data-input#ProxyRuleProviders") as DataInput,
                isUDP: this.querySelector("data-input#isUDP") as DataInput,
                isSSUoT: this.querySelector("data-input#isSSUoT") as DataInput,
                ForcedWS0RTT: this.querySelector("data-input#ForcedWS0RTT") as DataInput,
            }
        }
    }











    GetEndpoint (EndpointPath: string = String(this.Elements.Config.Basic.Endpoint.get())) {
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

        for (let i in this.Elements.Config.Extended) {
            if (NeededExtendConfig.includes(i as EndpointExtendConfigPrototype)) {
                this.Elements.Config.Extended[i].style.removeProperty("display")
            } else {
                this.Elements.Config.Extended[i].style.setProperty("display", "none")
            }
        }
    }

    CheckAndGenerate () {
        const BasicConfig = {
            SubURL: this.Elements.Config.Basic.SubURL.get(),
            Backend: this.Elements.Config.Basic.Backend.get() || this.defaultBackend,
            Endpoint: this.Elements.Config.Basic.Endpoint.get(),
            isShowHost: this.Elements.Config.Basic.isShowHost.get(),
            HTTPHeaders: JSON.stringify(JSON.parse(String(this.Elements.Config.Basic.HTTPHeaders.get()) || "{}")),
        }
        const ExtendConfig = {
            RuleProvider: this.Elements.Config.Extended.RuleProviderUserspec.get() || this.Elements.Config.Extended.RuleProvider.get(),
            ProxyRuleProviders: this.Elements.Config.Extended.ProxyRuleProviders.get(),
            isUDP: this.Elements.Config.Extended.isUDP.get(),
            isSSUoT: this.Elements.Config.Extended.isSSUoT.get(),
            ForcedWS0RTT: this.Elements.Config.Extended.ForcedWS0RTT.get(),
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

        this.Elements.Action.MsgBlock.innerText = this.GenerateSubURL(Config);

    }

    GenerateSubURL (Config: { SubURL: any; Backend: any; Endpoint: any; RuleProvider?: any; ProxyRuleProviders?: any; isUDP?: any; isSSUoT?: any; ForcedWS0RTT?: any; isShowHost: any, HTTPHeaders: any }) {
        let URLObj = new URL(Config.Backend);
        URLObj.pathname = Config.Endpoint;
        URLObj.search = "";
        URLObj.hash = "";

        URLObj.searchParams.append("url", Config.SubURL)
        Config.RuleProvider && URLObj.searchParams.append("remote_config", Config.RuleProvider)
        Config.ProxyRuleProviders && URLObj.searchParams.append("proxy_rule_providers", Config.ProxyRuleProviders && Config.Backend)
        Config.isUDP && URLObj.searchParams.append("udp", Config.isUDP.toString())
        Config.isSSUoT && URLObj.searchParams.append("ss_uot", Config.isSSUoT.toString())
        Config.isShowHost && URLObj.searchParams.append("show_host", Config.isShowHost.toString())
        Config.ForcedWS0RTT && URLObj.searchParams.append("forced_ws0rtt", Config.ForcedWS0RTT.toString())
        Config.HTTPHeaders !== "{}" && URLObj.searchParams.append("http_headers", Config.HTTPHeaders)
        return URLObj.toString();
    }

    CopyURL () {
        if (!navigator.clipboard) {
            alert("navigator.clipboard API not found on your drowser")
            return;
        }
        let URLtoCopy = this.Elements.Action.MsgBlock.innerText;
        navigator.clipboard.writeText(URLtoCopy).then( () => {
            alert("已将连接复制到剪贴板");
        }).catch(function(err) {
            alert(`err: ${err}`);
        });
    }
}

customElements.define("k-suburl-generator", SubURLGenerator)
console.info("[k-suburl-generator] registered")
