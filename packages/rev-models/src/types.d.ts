
declare interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}

declare interface Error {
    result?: any;
}
