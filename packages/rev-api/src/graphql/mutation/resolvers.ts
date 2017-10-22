import { IApiMethodMeta } from '../../api/meta';
import { IModelOperationResult } from 'rev-models';

export function getMethodResolver(methodName: string, meta: IApiMethodMeta) {
    return (value: any, args: any): IModelOperationResult<any, any> => {
        if (meta.validateModel) {
            if (!args || !args.model || typeof args.model != 'object') {
                throw new Error('Argument "model" must be an object');
            }
        }
        return {
            operation: { operation: methodName },
            success: true
        };
    };
}