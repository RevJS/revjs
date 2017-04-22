
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
}
