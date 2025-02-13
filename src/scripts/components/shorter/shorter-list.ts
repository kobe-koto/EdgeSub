import type { Form } from "../k-form";
import { getDefaultBackend } from "@scripts/utils/getDefaultBackend";

export class ShorterList extends HTMLElement {
    defaultBackend = getDefaultBackend()
    constructor () {
        super();
        this.Elements.SubmitButton.addEventListener("click", () => {this.Submit()})
    }
    async Submit () {
        this.Elements.Msg.innerText = "submitting..";
        // build request body
        let requestBody = {
            password: this.Elements.password.get()
        }

        // build api Endpoint
        let requestURL = new URL(this.defaultBackend);
        requestURL.pathname = "/short/list";

        await fetch(requestURL, {
            body: JSON.stringify(requestBody),
            method: "POST"
        }).then(async res => {
            const resText = await res.text();
            try {
                return JSON.parse(resText)
            } catch (e) {
                throw resText
            }
        }).then(res => {
            if (res.success) {
                if (res.shortIDs.length === 0) {
                    this.Elements.Msg.innerText = "no shorts to see, add some and try again :)";
                }
                this.Elements.Msg.innerText = res.shortIDs.join("\n");
            } else {
                this.Elements.Msg.innerText = `Error due to: ${res.msg}`;
            }
        }).catch((err) => {
            this.Elements.Msg.innerText = `Error: ${err}`;
        })
    }
    Elements = {
        password: this.querySelector("#password") as Form,

        Msg: this.querySelector("code#list-status") as HTMLElement,
        SubmitButton: this.querySelector("#list-submit") as HTMLButtonElement,
    }
}

customElements.define("shorter-list", ShorterList);
console.info("[shorter-list] registered")
