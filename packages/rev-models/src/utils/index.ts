
export function isSet(value: any): boolean {
    return (typeof value != 'undefined' && value !== null);
}

export function pretty(value: any, space: string | number = null): string {
    return JSON.stringify(value, null, space);
}
