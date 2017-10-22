
import { IModelOperationResult, ModelOperationResult } from 'rev-models';
import { ModelApiManager } from '../../api/manager';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';

export function getMethodResolver(manager: ModelApiManager, modelName: string, methodName: string) {
    let models = manager.modelManager;
    let meta = manager.getApiMeta(modelName);
    let methodMeta = meta.methods[methodName];

    return (value: any, args: any): Promise<IModelOperationResult<any, any>> => {
        let modelMeta = models.getModelMeta(modelName);
        let modelData = args ? args.model : undefined;
        let instance = models.hydrate(modelMeta.ctor, modelData);

        return (Promise.resolve() as any) // TODO: How can we tidy this up (without async / await?)
        .then(() => {
            if (methodMeta.validateModel) {
                if (!args || !args.model || typeof args.model != 'object') {
                    throw new Error('Argument "model" must be an object');
                }
                return models.validate(instance);
            }
            return null;
        })
        .then((res: ModelValidationResult) => {
            if (res && !res.valid) {
                let result = new ModelOperationResult({
                    operation: methodName
                });
                result.createValidationError(res);
                return result;
            }
            return models.exec(instance, methodName, args);
        });
    };
}