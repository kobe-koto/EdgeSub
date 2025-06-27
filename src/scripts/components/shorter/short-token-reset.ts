import type { DataInput } from "../data-input";
import { getDefaultBackend } from "@scripts/utils/getDefaultBackend";

export class ShortTokenResetter extends HTMLElement {
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
        requestURL.pathname = `/short/token-reset/${this.Elements.slug.get()}`;

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
        }).finally(() => {
            this.Elements.SubmitButton.disabled = false;
            this.Elements.SubmitButton.querySelector(".swap").classList.remove("swap-active");
        })
    }
    Elements = {
        slug: this.querySelector("data-input#slug") as DataInput,
        oldToken: this.querySelector("data-input#old-token") as DataInput,
        newToken: this.querySelector("data-input#new-token") as DataInput,

        Msg: this.querySelector("code"),
        SubmitButton: this.querySelector("#submit") as HTMLButtonElement,
    }
}

customElements.define("short-token-reset", ShortTokenResetter);
console.info("[short-token-reset] registered")

