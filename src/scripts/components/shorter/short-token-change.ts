import type { Form } from "../k-form";
import { getDefaultBackend } from "@scripts/utils/getDefaultBackend";

export class Shorter extends HTMLElement {
    defaultBackend = getDefaultBackend();
    constructor () {
        super();
        this.Elements.SubmitButton.addEventListener("click", () => {this.Submit()})
    }
    async Submit () {
        // build api Endpoint
        let requestURL = new URL(this.defaultBackend);
        requestURL.pathname = `/short/token-change/${this.Elements.slug.get()}`;

        await fetch(requestURL, {
            body: JSON.stringify({
                oldToken: this.Elements.oldToken.get(),
                newToken: this.Elements.newToken.get()
            }),
            method: "PATCH"
        }).then(async res => {
            // handle non-success request
            if (res.status !== 200) throw await res.text();
            // parse returned data as json
            return res.json()
        }).then(res => {
            this.Elements.Msg.innerText = res.msg;
        }).catch((err) => {
            this.Elements.Msg.innerText = `提交失败: ${err}`;
        })
    }
    Elements = {
        slug: this.querySelector("k-form#slug") as Form,
        oldToken: this.querySelector("k-form#old-token") as Form,
        newToken: this.querySelector("k-form#new-token") as Form,

        Msg: this.querySelector("code"),
        SubmitButton: this.querySelector("#submit"),
    }
}

customElements.define("short-token-change", Shorter);
console.info("[short-token-change] registered")

