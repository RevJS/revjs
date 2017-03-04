import { IModel } from './index';
import { IModelMeta } from './meta';
export declare function checkIsModelInstance(model: IModel): void;
export declare function checkIsModelConstructor(model: Function): void;
export declare function checkMetadataInitialised<T>(meta: IModelMeta<T>): void;
