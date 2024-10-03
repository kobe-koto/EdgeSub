export class Dropdown extends HTMLElement {
    selectedValue: string = this.dataset.selectedValue;
    constructor () {
        super();

        this.Elements.DropdownBotton.addEventListener("click", () => {
            this.dataset.onfocus = 
                this.dataset.onfocus === "false"
                 ? "true"
                 : "false"
        }) 

        for (let i of this.Elements.Items) {
            i.addEventListener("click", (event) => {
                const TargetElement = event.target as HTMLElement;
                for (let i of this.Elements.Items) {
                    i.dataset.selected = "false"
                }
                TargetElement.dataset.selected = "true";
                this.Elements.DropdownBottonText.innerText = TargetElement.innerText;
                this.selectedValue = TargetElement.dataset.value;
                this.dataset.selectedValue = this.selectedValue;
                this.dispatchEvent(
                    new CustomEvent("DropdownSelect", { 
                        detail: {
                            selectedValue: this.selectedValue
                        }
                    })
                )
            })

        }
    }
    Elements = {
        DropdownBotton: this.querySelector("button") as HTMLElement,
        DropdownBottonText: this.querySelector("button > span") as HTMLElement,
        Items: this.querySelectorAll(".dropdown-content > button") as unknown as HTMLButtonElement[]
    }
}
customElements.define("k-dropdown", Dropdown);
console.log("[k-dropdown] registered")