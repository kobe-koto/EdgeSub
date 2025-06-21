import type { DataInput } from "../data-input";
import { getDefaultBackend } from "@scripts/utils/getDefaultBackend";

export class Shorter extends HTMLElement {
    defaultBackend = getDefaultBackend();
    constructor () {
        super();
        this.Elements.SubmitButton.addEventListener("click", () => {this.Submit()})
    }
    async Submit () {

        this.Elements.SubmitButton.disabled = true;
        this.Elements.SubmitButton.querySelector(".swap").classList.add("swap-active");

        // build api Endpoint
        let requestURL = new URL(this.defaultBackend);
        requestURL.pathname = `/short/delete/${this.Elements.slug.get()}`;

        await fetch(requestURL, {
            body: JSON.stringify({
                token: this.Elements.token.get()
            }),
            method: "DELETE"
        }).then(async res => {
            // handle non-success request
            if (res.status !== 200) throw await res.text();
            // parse returned data as json
            return res.json()
        }).then(res => {
            this.Elements.Msg.innerText = res.msg;
        }).catch((err) => {
            this.Elements.Msg.innerText = `提交失败: ${err}`;
        }).finally(() => {
            this.Elements.SubmitButton.disabled = false;
            this.Elements.SubmitButton.querySelector(".swap").classList.remove("swap-active");
        })
    }
    Elements = {
        slug: this.querySelector("data-input#slug") as DataInput,
        token: this.querySelector("data-input#token") as DataInput,

        Msg: this.querySelector("code"),
        SubmitButton: this.querySelector("#submit") as HTMLButtonElement,
    }
}

customElements.define("short-destroyer", Shorter);
console.info("[short-destroyer] registered")

