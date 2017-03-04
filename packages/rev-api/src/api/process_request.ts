
export type HttpMethod = ['GET', 'POST', 'PUT', 'DELETE'];
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

export interface IRevApiRequest {
    method: HttpMethod;
    urlTokens: string[];
    urlParams: {
        [paramName: string]: string | string[]
    };
    headers: {
        [headerName: string]: string | string[]
    };
    bodyJson: any;
}

export type IRevApiReply =
    (err: Error, code: number, bodyJson: any) => void;

export function processRequest(request: IRevApiRequest, reply: IRevApiReply) {
    // check method
    // check tokens (find model)
    // check method against model
    // fire off to processCreate / Update / Read / Remove method
}
