
declare interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}

declare interface Function {
    name: string;
}

declare interface Error {
    result?: any;
}
