export class Switch extends HTMLElement {
    checked: boolean = this.dataset.checked === "true"
    constructor () {
        super ();

        this.addEventListener("click", () => {
            this.setChecked(!this.getChecked())
        });
    }
    setChecked (TargetStatus: boolean) {
        this.checked = TargetStatus;
        this.dataset.checked = this.checked.toString();
    }
    getChecked () {
        return this.checked;
    }
}
customElements.define("k-switch", Switch);
console.info("[k-switch] registered")