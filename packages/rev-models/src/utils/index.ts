
export function isSet(value: any): boolean {
    return (typeof value != 'undefined' && value !== null);
}

export function printObj(value: any, multiline = false): string {
    return JSON.stringify(value, null, multiline ? 2 : undefined);
}

export function escapeForRegex(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
