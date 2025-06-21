import type { DataInput } from "../data-input";
import { getDefaultBackend } from "@scripts/utils/getDefaultBackend";

export class Shorter extends HTMLElement {
    defaultBackend = getDefaultBackend();
    constructor () {
        super();
        this.setupEventListeners()
    }
    private setupEventListeners () {
        this.Elements.SubmitButton.addEventListener("click", () => {this.Submit()});
        this.Elements.CopyButton.addEventListener("click", () => {this.Copy()});
    }
    private Copy () {
        // copy slug and token to clipboard
        let slug = `short:${String(this.Elements.slug.get())}`;
        navigator.clipboard.writeText(slug).then(() => {
            alert(`已复制: ${slug}`);
        }).catch(err => {
            alert(`复制失败: ${err}`);
        });
    }
    private async Submit () {
        this.Elements.SubmitButton.disabled = true;
        this.Elements.Msg.innerText = "正在提交...";
        this.Elements.SubmitButton.querySelector(".swap").classList.add("swap-active");

        // build request body
        let requestBody = {
            subdata: this.Elements.subdata.get(),
            slug: this.Elements.slug.get(),
            token: this.Elements.token.get(),
        }

        // build api Endpoint
        let requestURL = new URL(this.defaultBackend);
        requestURL.pathname = "/short/put";

        await fetch(requestURL, {
            body: JSON.stringify(requestBody),
            method: "POST"
        }).then(async res => {
            // handle non-success request
            if (res.status !== 200) throw await res.text();
            // parse returned data as json
            return res.json()
        }).then(res => {
            this.Elements.Msg.innerText = `short:${res.slug}`;
            // sync slug and token with reponse
            this.Elements.slug.set(res.slug);
            this.Elements.token.set(res.token);


            this.Elements.SubmitButton.disabled = false;
            this.Elements.SubmitButton.querySelector(".swap").classList.remove("swap-active");
        }).catch((err) => {
            this.Elements.Msg.innerText = `提交失败: ${err}`;

            this.Elements.SubmitButton.disabled = false;
            this.Elements.SubmitButton.querySelector(".swap").classList.remove("swap-active");
        })
    }
    Elements = {
        subdata: this.querySelector("data-input#SubURL") as DataInput,

        slug: this.querySelector("data-input#short-slug") as DataInput,
        token: this.querySelector("data-input#short-token") as DataInput,

        Msg: this.querySelector("code"),
        SubmitButton: this.querySelector("button#shorter") as HTMLButtonElement,
        CopyButton: this.querySelector("button#copy") as HTMLButtonElement,
    }
}

customElements.define("k-shorter", Shorter);
console.info("[k-shorter] registered")

