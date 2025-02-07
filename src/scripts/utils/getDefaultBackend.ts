export function getDefaultBackend () {
    let URLObj = new URL(location.href);
    URLObj.pathname = "";
    URLObj.search = "";
    URLObj.hash = "";

    return URLObj.host === "localhost:4321" ? "http://localhost:8788" : URLObj.toString();
}
