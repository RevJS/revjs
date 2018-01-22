
// global fetch (for tests)
declare module NodeJS  {
    interface Global {
        fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
    }
}
