export function removeUndefinedFields (obj: object) : object {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            removeUndefinedFields(obj[key]);
        }
        if (obj[key] === undefined) {
            delete obj[key];
        }
    }
    return obj;
}
