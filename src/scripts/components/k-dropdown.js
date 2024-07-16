export class Dropdown extends HTMLElement {
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
                for (let i of this.Elements.Items) {
                    i.dataset.selected = "false"
                }

                event.target.dataset.selected = "true";
                this.Elements.DropdownBottonText.innerText = event.target.innerText;
                this.dataset.selectedValue = event.target.dataset.value;
            })

        }
    }
    Elements = {
        DropdownBotton: this.querySelector("button"),
        DropdownBottonText: this.querySelector("button > span"),
        Items: this.querySelectorAll(".dropdown-content > button")
    }
}
