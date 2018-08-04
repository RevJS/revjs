export {};

declare global {
    // tslint:disable-next-line:interface-name
    interface Error {
        result?: any;
    }
}
