import type { Dropdown } from "@scripts/components/k-dropdown";

export class DataInput extends HTMLElement {
    type = this.dataset.type;
    
    constructor () {
        super ();
    }

    get () {
        if (this.type === "textarea") {
            return this.querySelector("textarea").value.trim();
        } else if (this.type === "input") {
            return this.querySelector("input").value.trim();
        } else if (this.type === "k-dropdown") {
            const DropdownElement = this.querySelector("k-dropdown") as Dropdown;
            return DropdownElement?.dataset.selectedValue;
        } else if (this.type === "toggle") {
            const ToggleElement = this.querySelector("input.toggle") as HTMLInputElement;
            return ToggleElement.checked;
        }
    }
    
    set (value: string) {
        if (this.type === "textarea") {
            this.querySelector("textarea").value = value.trim()
        } else if (this.type === "input") {
            this.querySelector("input").value = value.trim()
        } else if (this.type === "k-dropdown") {
            const DropdownElement = this.querySelector("k-dropdown") as Dropdown;
            DropdownElement.select(value);
        } else if (this.type === "toggle") {
            const SwitchElement = this.querySelector("toggle") as HTMLInputElement;
            SwitchElement.checked = value == "true"; // "true" or true or whatever.... it should be boolean
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


function maybeWaitFor(tag) {
    return customElements.get(tag) || document.querySelector(tag)
      ? customElements.whenDefined(tag)
      : Promise.resolve(); // No need to wait
  }
  
Promise.all([
    maybeWaitFor("toggle"),
    maybeWaitFor("k-dropdown")
]).then(() => {
    console.log("[data-input] dependency elements toggle and k-dropdown registered, initializing");
    customElements.define("data-input", DataInput);
    console.info("[data-input] registered")
});

// Promise.all([
//     customElements.whenDefined("toggle"),
//     customElements.whenDefined("k-dropdown")
// ]).then(() => {
//     console.log("[data-input] dependency toggle and k-dropdown registration detected, initializing");
//     customElements.define("data-input", DataInput);
//     console.info("[data-input] registered")
// });
