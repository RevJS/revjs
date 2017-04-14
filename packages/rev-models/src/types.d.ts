
declare interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}

declare interface Function {
    name: string;
    meta?: any;
}

declare interface Error {
    result?: any;
}
