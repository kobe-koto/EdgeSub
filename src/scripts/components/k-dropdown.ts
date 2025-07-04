export class Dropdown extends HTMLElement {
    constructor () {
        super();
        
        this.initializeElements();
        this.setupEventListeners();
    }

    private initializeElements() {
        this.Elements = {
            DropdownBotton: this.querySelector("div.btn") as HTMLElement,
            DropdownBottonText: this.querySelector("div.btn > span") as HTMLElement,
            Items: this.querySelectorAll(".dropdown-content > li > a") as NodeListOf<HTMLButtonElement>
        };
    }

    private setupEventListeners() {
        this.Elements.Items.forEach(item => {
            item.addEventListener("click", (event) => {
                const targetElement = event.target as HTMLElement;
                this.select(targetElement.dataset.value);
            });
        });
    }

    public select(value: string) {
        if (!value) {
            console.error("[k-dropdown.select] value is required")
            return false;
        };

        this.dataset.selectedValue = value;
        
        // mark the selected
        this.Elements.Items.forEach(item => {
            if (item.dataset.value === value) {
                item.classList.add("menu-active")
                this.Elements.DropdownBottonText.innerText = item.innerText;
            } else {
                // cancel non-targets out
                item.classList.remove("menu-active")
            }
        });

        // dispatch custom event to notify
        this.dispatchEvent(new CustomEvent("dropdown-select", {
            bubbles: true,
            composed: true,
            detail: {
                value,
            }
        }));
    }

    Elements: {
        DropdownBotton: HTMLElement;
        DropdownBottonText: HTMLElement;
        Items: NodeListOf<HTMLButtonElement>;
    }
}

customElements.define("k-dropdown", Dropdown);
console.info("[k-dropdown] registered")