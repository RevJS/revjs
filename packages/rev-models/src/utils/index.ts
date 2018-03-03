
/**
 * @private
 */
export function isSet(value: any): boolean {
    return (typeof value != 'undefined' && value !== null);
}

/**
 * @private
 */
export function printObj(value: any, multiline = false): string {
    return JSON.stringify(value, null, multiline ? 2 : undefined);
}

/**
 * @private
 */
export function escapeForRegex(str: string) {
    if (typeof str != 'string') {
        throw new TypeError('Supplied value is not a string!');
    }
    return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
}

/**
 * @private
 */
export function withTimeout<T>(promise: Promise<T>, timeout: number, name: string) {
    return Promise.race([
        promise,
        new Promise<T>((resolve, reject) => {
            setTimeout(() => {
                reject(new Error(`${name} - timed out after ${timeout} milliseconds`));
            }, timeout);
        })
    ]);
}
