
export function deepCopy(obj: object) {
    const clone = {};
    for (let key in obj) {
        if (obj[key] != null && typeof(obj[key]) == 'object') {
            clone[key] = deepCopy(obj[key]);
        }
        else {
            clone[key] = obj[key];
        }
    }
    return clone;
}
