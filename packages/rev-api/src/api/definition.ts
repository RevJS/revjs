
import { IApiMethod } from './method';
import { Model } from 'rev-models';

export interface IApiDefinition<T extends Model> {
    model: new(...args: any[]) => T;
    methods: {
        [name: string]: IApiMethod | boolean;
    } | string[];
}
