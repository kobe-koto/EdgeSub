import type { Form } from "../k-form";
import { getDefaultBackend } from "@scripts/utils/getDefaultBackend";

export class ShortEditor extends HTMLElement {
    defaultBackend = getDefaultBackend()
    constructor () {
        super();
        this.Elements.SubmitButton.addEventListener("click", () => {this.Submit()})
        this.Elements.FetchButton.addEventListener("click", () => {this.Fetch()})
        let PassedID = new URL(location.href).searchParams.get("id");
        if (PassedID) {
            this.Elements.ShortID.set(PassedID)
            this.Fetch()
        }
    }
    Fetch () {
        this.Elements.ShortData.set("fetching...")
        
        let requestURL = new URL(this.defaultBackend);
        requestURL.pathname = `/short/get/${this.Elements.ShortID.get()}`;


        fetch(requestURL)
        .then(res => res.json())
        .then(res => {
            this.Elements.ShortData.set(res.subdata)
        }).catch((err) => {
            alert(`Error: ${err}`);
        })
    }
    Submit () {
        // build request body
        let requestBody = {
            subdata: this.Elements.ShortData.get(),
            slug: this.Elements.ShortID.get(),
            token: this.Elements.ShortPassword.get(),
        }

        // build api Endpoint
        let requestURL = new URL(this.defaultBackend);
        requestURL.pathname = "/short/put";

        fetch(requestURL, {
            body: JSON.stringify(requestBody),
            method: "POST"
        }).then(async res => {
            // handle non-success request
            if (res.status !== 200) throw await res.text();
            // parse returned data as json
            return res.json()
        }).then(res => {
            this.Elements.Msg.innerText = `short:${res.slug}`;
        }).catch((err) => {
            this.Elements.Msg.innerText = `提交失败: ${err}`;
        })



    }
    Elements = {
        ShortID: this.querySelector("#short-id") as Form,
        ShortPassword: this.querySelector("#short-password") as Form,

        ShortData: this.querySelector("#short-data") as Form,

        Msg: this.querySelector("code") as HTMLElement,
        
        FetchButton: this.querySelector("#editor-fetch") as HTMLButtonElement,
        SubmitButton: this.querySelector("#editor-submit") as HTMLButtonElement,
    }
}

customElements.define("short-editor", ShortEditor);
console.info("[short-editor] registered")


