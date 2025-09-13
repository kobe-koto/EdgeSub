import type { DataInput } from "@scripts/components/data-input";
import type { EndpointExtendConfigPrototype, EndpointPrototype } from "@config/AvalibleOptoutFormat";
import { getDefaultBackend } from "@scripts/utils/getDefaultBackend";
import { copyToClipboard } from "@scripts/utils/copy";
import filterObject from "@scripts/utils/filterObject";

const UniversalExtendConfig = ["isShowHost", "HTTPHeaders"];

class SubURLGenerator extends HTMLElement {
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
        this.Elements.Action.Copy.addEventListener("click", () => {
            copyToClipboard(this.Elements.Action.MsgBlock.innerText)
                .then(() => {
                    alert("已将连接复制到剪贴板");
                })
                .catch((err) => {
                    console.error("[k-suburl-generator] copy failed", err);
                    alert("复制失败, 请检查浏览器权限设置, 版本, 或尝试手动复制.");
                });
        });
        this.Elements.Config.Basic.Endpoint.addEventListener("dropdown-select", (event: CustomEvent) => {
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
        });
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
                RuleProvidersProxy: this.querySelector("data-input#RuleProvidersProxy") as DataInput,
                isUDP: this.querySelector("data-input#isUDP") as DataInput,
                isSSUoT: this.querySelector("data-input#isSSUoT") as DataInput,
                ForcedWS0RTT: this.querySelector("data-input#ForcedWS0RTT") as DataInput,
            }
        }
    }

    private GetEndpoint (EndpointPath: string = String(this.Elements.Config.Basic.Endpoint.get())) {
        for (let i of this.Endpoints) {
            if (i.value === EndpointPath) {
                return i as EndpointPrototype;
            }
        }
        throw `no targeted endpoint found, expected value ${EndpointPath}`
    }

    private getConfig () {
        return {
            Basic: {
                SubURL: this.Elements.Config.Basic.SubURL.get() as string,
                Backend: (this.Elements.Config.Basic.Backend.get() || this.defaultBackend) as string,
                Endpoint: this.Elements.Config.Basic.Endpoint.get() as string,
                isShowHost: this.Elements.Config.Basic.isShowHost.get() as boolean,
                HTTPHeaders: JSON.stringify(JSON.parse(String(this.Elements.Config.Basic.HTTPHeaders.get()) || "{}")) as string,
            },
            Extended: {
                RuleProvider: (this.Elements.Config.Extended.RuleProviderUserspec.get() || this.Elements.Config.Extended.RuleProvider.get()) as string,
                RuleProvidersProxy: (this.Elements.Config.Extended.RuleProvidersProxy.get() && this.Elements.Config.Basic.Backend.get() || this.defaultBackend) as string,
                isUDP: this.Elements.Config.Extended.isUDP.get() as boolean,
                isSSUoT: this.Elements.Config.Extended.isSSUoT.get() as boolean,
                ForcedWS0RTT: this.Elements.Config.Extended.ForcedWS0RTT.get() as boolean,
            }
        }
    }



    CheckAndGenerate () {
        // Get required (extended) config
        const Config = this.getConfig();
        for (let i of this.GetEndpoint().ExtendConfig || []) {
            if (!(i in Config.Extended)) { // not required! just remove it from Config.Extended :D
                delete Config.Extended[i];
            }
        }
        

        // non-empty check
        let ErrorOccurred = false;
        for (let [key, value] of Object.entries(Config.Basic)) {
            if (typeof value === "string" && value.length === 0) {
                alert(`${key} can't be empty`);
                ErrorOccurred = true;
                continue;
            }
        }
        if (ErrorOccurred === true) {
            return;
        }

        // now we do some real works! con---gra---tu---la--tion---s---!

        // grab the backend
        let URLObj = new URL(Config.Basic.Backend);
        URLObj.pathname = Config.Basic.Endpoint;
        URLObj.search = "";
        URLObj.hash = "";

        // append inputed data (subdata)
        URLObj.searchParams.append("url", Config.Basic.SubURL)

        // append extended config
        // - currently we do this mapping on client side, 
        //   but in the future we may want to do this on server side, 
        //   just to keep the URL clean and uniform.
        let Mapping = {
            "RuleProvider": "remote_config",
            "RuleProvidersProxy": "rule_providers_proxy",
            "isUDP": "udp",
            "isSSUoT": "ss_uot",
            "ForcedWS0RTT": "forced_ws0rtt",
            "isShowHost": "show_host",
            "HTTPHeaders": "http_headers"
        }

        for (let [key, value] of Object.entries({
            ...Config.Extended, 
            ...filterObject(Config.Basic, (key) => UniversalExtendConfig.includes(key))
        })) {
            // empty check would be unnecessary here, since we already checked it above
            URLObj.searchParams.append(Mapping[key] || key, String(value));
        }

        this.Elements.Action.MsgBlock.innerText = URLObj.toString();

    }
}

customElements.define("k-suburl-generator", SubURLGenerator)
console.info("[k-suburl-generator] registered")
