/**
 * Assign source to target, note that its only for the first frame. 
 * You will not get the target modified, instead, the target you need is in the returns.
 * @param {Object} target 
 * @param {Object} source 
 * @returns {Object} Assigned Target
 */
export function TrulyAssign (target, source) {
    let DeepCopiedTarget = JSON.parse(JSON.stringify(target))
    for (let key in source) {
        let value = source[key];
        if (value) {
            DeepCopiedTarget[key] = value;
        }
    }
    return DeepCopiedTarget;
}
