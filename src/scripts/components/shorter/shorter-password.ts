import type { DataInput } from "../data-input";
import { getDefaultBackend } from "@scripts/utils/getDefaultBackend";

export class ShorterPassword extends HTMLElement {
    defaultBackend = getDefaultBackend()
    constructor () {
        super();
        this.Elements.SubmitButton.addEventListener("click", () => {this.Submit()})
    }
    async Submit () {

        this.Elements.SubmitButton.disabled = true;
        this.Elements.SubmitButton.querySelector(".swap").classList.add("swap-active");

        this.Elements.Msg.innerText = "submitting..";
        // build request body
        let requestBody = {
            newPassword: this.Elements.newPassword.get(),
            oldPassword: this.Elements.oldPassword.get()
        }

        // build api Endpoint
        let requestURL = new URL(this.defaultBackend);
        requestURL.pathname = "/short/admin-password/set";

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
            if (res.passwordUpdated) {
                this.Elements.Msg.innerText = "Password updated.";
            } else {
                this.Elements.Msg.innerText = `Cannot update password due to: ${res.msg}`;
            }
        }).catch((err) => {
            this.Elements.Msg.innerText = `Error: ${err}`;
        }).finally(() => {
            this.Elements.SubmitButton.disabled = false;
            this.Elements.SubmitButton.querySelector(".swap").classList.remove("swap-active");
        });
    }
    Elements = {
        oldPassword: this.querySelector("#old-password") as DataInput,
        newPassword: this.querySelector("#new-password") as DataInput,

        Msg: this.querySelector("code") as HTMLElement,
        SubmitButton: this.querySelector("#password-submit") as HTMLButtonElement,
    }
}

customElements.define("shorter-password", ShorterPassword);
console.info("[shorter-password] registered")
