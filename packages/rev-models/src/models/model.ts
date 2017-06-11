import { IValidationContext } from '../operations/validate';

export interface IModelData {
    [fieldName: string]: any;
}

export class Model {
    constructor(data?: IModelData) {
        if (this.constructor == Model) {
            throw new Error('ModelError: You should not instantiate the Model class directly');
        }
        if (data) {
            if (typeof data != 'object') {
                throw new Error('ModelError: initial data must be an object');
            }
            Object.assign(this, data);
        }
    }

    validate(vc: IValidationContext): void {
        return;
    }

    validateAsync(vc: IValidationContext): Promise<void> {
        return Promise.resolve();
    }
}

export type ModelCtor = new(...args: any[]) => Model;
