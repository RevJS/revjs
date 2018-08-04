
export {};

declare global {
    // tslint:disable-next-line:interface-name
    interface Error {
        response?: any;
    }
}
