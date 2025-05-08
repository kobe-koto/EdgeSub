export class Dropdown extends HTMLElement {
    selectedValue: string = this.dataset.selectedValue;

    constructor () {
        super();
        this.initializeElements();
        // 延迟初始化选中值
        setTimeout(() => {
            this.setupEventListeners();
            this.updateSelectedValue(this.selectedValue, false);
        }, 100);

        this.addEventListener("DropdownSelect", (event: CustomEvent) => {
            this.updateSelectedValue(event.detail.selectedValue, false);
        });
    }

    private initializeElements() {
        this.Elements = {
            DropdownBotton: this.querySelector("button") as HTMLElement,
            DropdownBottonText: this.querySelector("button > span") as HTMLElement,
            Items: this.querySelectorAll(".dropdown-content > button") as NodeListOf<HTMLButtonElement>
        };
    }

    private setupEventListeners() {
        this.Elements.DropdownBotton.addEventListener("click", () => {
            this.dataset.onfocus = this.dataset.onfocus === "false" ? "true" : "false";
        });

        this.Elements.Items.forEach(item => {
            item.addEventListener("click", (event) => {
                const targetElement = event.target as HTMLElement;
                this.updateSelectedValue(targetElement.dataset.value, true);
            });
        });
    }

    private updateSelectedValue(value: string, dispatchEvent: boolean = true) {
        if (!value) return;
        
        this.Elements.Items.forEach(item => {
            item.dataset.selected = (item.dataset.value === value).toString();
            if (item.dataset.value === value) {
                this.Elements.DropdownBottonText.innerText = item.innerText;
                const shouldDispatchEvent = dispatchEvent && this.selectedValue !== value;
                if (shouldDispatchEvent) {
                    this.selectedValue = value
                    this.dataset.selectedValue = value
                    this.dispatchEvent(new CustomEvent("DropdownSelect", {
                        detail: { selectedValue: value },
                        bubbles: true
                    }))
                }
            }
        });
    }

    Elements: {
        DropdownBotton: HTMLElement;
        DropdownBottonText: HTMLElement;
        Items: NodeListOf<HTMLButtonElement>;
    }
}

customElements.define("k-dropdown", Dropdown);
console.info("[k-dropdown] registered")