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
        })
    }
    Elements = {
        slug: this.querySelector("k-form#slug") as Form,
        token: this.querySelector("k-form#token") as Form,

        Msg: this.querySelector("code"),
        SubmitButton: this.querySelector("#submit"),
    }
}

customElements.define("short-destroyer", Shorter);
console.info("[short-destroyer] registered")

