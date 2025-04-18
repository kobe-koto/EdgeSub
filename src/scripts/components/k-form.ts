import type { Switch } from "@scripts/components/k-switch";
import type { Dropdown } from "@scripts/components/k-dropdown";

export class Form extends HTMLElement {
    type = this.dataset.type;
    
    constructor () {
        super ();
        
        // restore cache
        if (this.dataset.enableCache === "true") {
            this.restoreCachedValue()
            this.setupChangeListener()
        }
    }

    private restoreCachedValue() {
        const cachedValue = localStorage.getItem(`form-${this.id}`);
        console.info(`[k-form] Restored cache for Form ID '${this.id}' (cached value: ${cachedValue})`);
        
        if (cachedValue !== null) {
            if (this.type === "textarea" || this.type === "input") {
                this.set(cachedValue);
            } else if (this.type === "k-switch") {
                const SwitchElement = this.querySelector("k-switch") as Switch;
                if (SwitchElement) {
                    SwitchElement.set(cachedValue === "true");
                }
            } else if (this.type === "k-dropdown") {
                const DropdownElement = this.querySelector("k-dropdown") as Dropdown;
                console.log(`[k-form] Found dropdown for ${this.id}:`, DropdownElement);
                if (DropdownElement) {
                    console.log(`[k-form] Setting dropdown value for ${this.id} to:`, cachedValue);
                    DropdownElement.dataset.selectedValue = cachedValue;
                    // 手动触发一个事件来通知下拉框组件更新显示
                    DropdownElement.dispatchEvent(new CustomEvent('DropdownSelect', {
                        detail: { selectedValue: cachedValue },
                        bubbles: true,
                        cancelable: true
                    }));
                }
            }
        }
    }
    private setupChangeListener() {
        if (this.type === "textarea" || this.type === "input") {
            const element = this.querySelector(this.type === "textarea" ? "textarea" : "input");
            element?.addEventListener("input", () => this.cacheValue());
        } else if (this.type === "k-switch") {
            const element = this.querySelector("k-switch");
            element?.addEventListener("change", () => this.cacheValue());
        } else if (this.type === "k-dropdown") {
            const element = this.querySelector("k-dropdown");
            element?.addEventListener("DropdownSelect", (event: CustomEvent) => {
                console.log(`[k-form] Dropdown value changed for ${this.id}:`, event.detail);
                this.cacheValue();
            });
        }
    }

    private cacheValue() {
        const value = this.get().toString();
        console.debug(`[k-form] Caching value for ${this.id}:`, value);
        if (value !== undefined) {
            localStorage.setItem(`form-${this.id}`, value);
        }
    }

    get () {
        if (this.type === "textarea") {
            return this.querySelector("textarea").value
        } else if (this.type === "input") {
            return this.querySelector("input").value
        } else if (this.type === "k-dropdown") {
            const DropdownElement = this.querySelector("k-dropdown") as Dropdown;
            return DropdownElement?.dataset.selectedValue;
        } else if (this.type === "k-switch") {
            const SwitchElement = this.querySelector("k-switch") as Switch;
            return SwitchElement.get()
        }
    }
    
    set (value: string) {
        if (this.type === "textarea") {
            this.querySelector("textarea").value = value.trim()
        } else if (this.type === "input") {
            this.querySelector("input").value = value.trim()
        } else if (this.type === "k-switch") {
            const SwitchElement = this.querySelector("k-switch") as Switch;
            return SwitchElement.set(value === "true")
        }
    }

    setDetail(value: string) {
        if (this.type === "textarea") {
            this.querySelector("textarea").placeholder = value;
            return true;
        } else if (this.type === "input") {
            this.querySelector("input").placeholder = value;
            return true;
        }
        return false;
    }

    getDetail() {
        if (this.type === "textarea") {
            return this.querySelector("textarea").placeholder;
        } else if (this.type === "input") {
            return this.querySelector("input").placeholder;
        }
    }
}

Promise.all([
    customElements.whenDefined("k-switch"),
    customElements.whenDefined("k-dropdown")
]).then(() => {
    console.log("[k-form] dependency k-switch and k-dropdown registration detected, initializing");
    customElements.define("k-form", Form);
    console.info("[k-form] registered")
});
