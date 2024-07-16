export class Switch extends HTMLElement {
    constructor () {
        super ();

        this.addEventListener("click", function (event) {
            this.dataset.checked =
                this.dataset.checked === "false" ? "true" : "false";
        });
    }
}
