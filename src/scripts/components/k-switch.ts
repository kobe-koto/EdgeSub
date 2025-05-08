export class Switch extends HTMLElement {
    constructor () {
        super ();
        
        this.addEventListener("click", () => {
            this.set(!this.get());
        });
    }


    set(TargetStatus: boolean, Notify: boolean = true) {
        this.dataset.checked = TargetStatus.toString()
        if (Notify) {
            this.dispatchEvent(new Event("change"));
        }
    }

    get() {
        return this.dataset.checked === "true";
    }

}

customElements.define("k-switch", Switch);
console.info("[k-switch] registered")