export function copyToClipboard(text: string) {
    return new Promise((resolve, reject) => {
        if (!navigator.clipboard) {
            reject(new Error("Clipboard API not supported"));
            return;
        }
        navigator.clipboard.writeText(text)
            .then(() => resolve(void 0))
            .catch(err => reject(err));
    });
}