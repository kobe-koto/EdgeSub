export class Switch extends HTMLElement {
    private _checked: boolean = this.dataset.checked === "true"

    constructor () {
        super ();
        
        this.addEventListener("click", () => {
            this.updateCheckedState(!this.getChecked(), true);
        });

        // Listen for external switch events
        this.addEventListener("SwitchChange", (event: CustomEvent) => {
            this.updateCheckedState(event.detail.checked, false);
        });
    }

    get checked(): boolean {
        return this._checked;
    }

    set checked(value: boolean) {
        this.updateCheckedState(value, false);
    }

    private updateCheckedState(value: boolean, dispatchEvent: boolean = true) {
        this._checked = value;
        this.dataset.checked = value.toString();

        if (dispatchEvent) {
            this.dispatchEvent(new CustomEvent("SwitchChange", {
                detail: { checked: value },
                bubbles: true
            }));
            this.dispatchEvent(new Event("change"));
        }
    }

    setChecked(TargetStatus: boolean) {
        this.updateCheckedState(TargetStatus, true);
    }

    getChecked() {
        return this.checked;
    }
}

customElements.define("k-switch", Switch);
console.info("[k-switch] registered")