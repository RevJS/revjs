import { IModel } from '../model';

export interface IStorage {
    create(model: IModel, vals: any, options: any): Promise<any>;
    update(model: IModel, vals: any, where: any, options: any): Promise<any>;
    get(model: IModel, where: any, options: any): Promise<any>;
}
