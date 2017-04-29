
import { fields } from 'rev-models';

export interface IApiMethodContext {
    TODO_add_useful_context: string;
}

export interface IApiMethod {
    args: Array<fields.Field | string>;
    handler: (context: IApiMethodContext, ...args: any[]) => Promise<any>;
}
