
import { IApiMethod } from './method';
import { IModel } from 'rev-models';

export interface IApiDefinition<T extends IModel> {
    model: new(...args: any[]) => T;
    operations?: string[];
    methods?: {
        [name: string]: IApiMethod;
    };
}
