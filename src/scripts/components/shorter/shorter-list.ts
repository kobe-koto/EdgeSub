import type { Form } from "../k-form";
import { getDefaultBackend } from "@scripts/utils/getDefaultBackend";

export class ShorterList extends HTMLElement {
    defaultBackend = getDefaultBackend()
    constructor () {
        super();
        this.Elements.SubmitButton.addEventListener("click", () => {this.Submit()})
    }
    async Submit () {
        // this.Elements.Msg.innerText = "submitting..";
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
                    alert("no shorts to see, add some and try again :)");
                }
                Array.from(this.Elements.ListItems.querySelectorAll("list-item:not(.prototype)")).map(i=>i.remove())
                for (let i of res.shortIDs) {
                    let t = this.Elements.ListItemPrototype.cloneNode(true) as ListItem;
                    t.update(i.name.replace(/^short\:/, ""), i.timestamp || 0)
                    t.classList.remove("prototype")
                    this.Elements.ListItems.appendChild(t)
                }
            } else {
                alert(`Error due to: ${res.msg}`);
            }
        }).catch((err) => {
            alert(`Error: ${err}`);
        })
    }
    Elements = {
        password: this.querySelector("#password") as Form,
        SubmitButton: this.querySelector("#list-submit") as HTMLButtonElement,
        ListItemPrototype: this.querySelector("list-item.prototype") as ListItem,
        ListItems: this.querySelector("#list-items") as HTMLElement,
    }
}

customElements.define("shorter-list", ShorterList);
console.info("[shorter-list] registered")



export class ListItem extends HTMLElement {
    defaultBackend = getDefaultBackend()
    constructor () {
        super();
        
        this.Elements.CopyButton.addEventListener("click", () => {this.CopyID()})
        this.Elements.EditButton.addEventListener("click", () => {this.JumpToEdit()})
    }
    CopyID () {
        if (!navigator.clipboard) {
            alert("navigator.clipboard API not found on your drowser")
            return;
        }
        navigator.clipboard.writeText(`short:${this.Elements.IDInfo.innerText}`).then( () => {
            alert("已将 Short ID 复制到剪贴板");
        }).catch(function(err) {
            alert(`err: ${err}`);
        });
    }
    JumpToEdit () {
        location.assign(`/shorter/edit/?id=${this.Elements.IDInfo.innerText}`)
    }
    update (ShortID, EditTimestamp) {
        this.Elements.IDInfo.innerText = ShortID;
        let EditDate = new Date(EditTimestamp);
        this.Elements.DateInfo.innerText = `${EditDate.toLocaleDateString()} ${EditDate.toLocaleTimeString()}`;
    }
    Elements = {
        EditButton: this.querySelector(".item-edit") as HTMLButtonElement,
        CopyButton: this.querySelector(".item-copy") as HTMLButtonElement,
        IDInfo: this.querySelector(".item-id") as HTMLElement,
        DateInfo: this.querySelector(".item-date") as HTMLSpanElement,
    }
}

customElements.define("list-item", ListItem);
console.info("[shorter-list: list-item] registered")
