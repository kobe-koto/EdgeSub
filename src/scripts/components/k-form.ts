import type { Switch } from "@scripts/components/k-switch";
import type { Dropdown } from "@scripts/components/k-dropdown";

export class Form extends HTMLElement {
    type = this.dataset.type;
    // id = this.id;
    constructor () {
        super ();
        return this;
    }
    get () {
        if (this.type === "textarea") {
            return this.querySelector("textarea").value
        } else if (this.type === "input") {
            return this.querySelector("input").value
        } else if (this.type === "k-dropdown") {
            const DropdownElement = this.querySelector("k-dropdown") as Dropdown;
            return DropdownElement.dataset.selectedValue;
        } else if (this.type === "k-switch") {
            const SwitchElement = this.querySelector("k-switch") as Switch;
            return SwitchElement.checked.toString();
        }
    }
    set (value: ("textarea" | "input")) {
        if (this.type === "textarea") {
            this.querySelector("textarea").value = value.trim()
        } else if (this.type === "input") {
            this.querySelector("input").value = value.trim()
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
customElements.define("k-form", Form);
console.info("[k-form] registered")