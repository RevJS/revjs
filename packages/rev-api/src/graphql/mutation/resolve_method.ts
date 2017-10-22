
import { IModelOperationResult, ModelOperationResult, ModelManager } from 'rev-models';
import { ModelApiManager } from '../../api/manager';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { IApiMethodMeta } from '../../api/meta';
import { IModelOperation } from 'rev-models/lib/operations/operation';

export function getMethodResolver(manager: ModelApiManager, modelName: string, methodName: string) {
    let models = manager.modelManager;
    let meta = manager.getApiMeta(modelName);
    let methodMeta = meta.methods[methodName];

    return (value: any, args: any): Promise<IModelOperationResult<any, any>> => {
        let modelMeta = models.getModelMeta(modelName);
        let modelData = args ? args.model : undefined;
        let instance = models.hydrate(modelMeta.ctor, modelData);

        return validateMethodModelData(models, methodMeta, instance, args)
        .then((res: ModelValidationResult) => {
            if (res && !res.valid) {
                let result = new ModelOperationResult({
                    operation: methodName
                });
                result.createValidationError(res);
                return result;
            }
            else {
                let methodArgData = getMethodArgData(methodMeta, args);
                return validateMethodArgData(models, methodMeta, methodArgData)
                .then((argRes) => {
                    if (argRes.valid) {
                        return models.exec(instance, methodName, methodArgData);
                    }
                });
            }
        });
    };
}

function validateMethodModelData(models: ModelManager, meta: IApiMethodMeta, instance: any, args: any): Promise<ModelValidationResult> {
    if (meta.modelArg) {
        if (!args || !args.model || typeof args.model != 'object') {
            throw new Error('Argument "model" must be an object');
        }
        return models.validate(instance);
    }
    else {
        return Promise.resolve(null);
    }
}


function getMethodArgData(meta: IApiMethodMeta, args: any) {
    let argsModel = {};
    if (meta.args) {
        for (let field of meta.args) {
            argsModel[field.name] = args[field.name];
        }
    }
    return argsModel;
}

function validateMethodArgData(models: ModelManager, meta: IApiMethodMeta, args: any): Promise<ModelValidationResult> {

    let promises: Array<Promise<any>> = [];
    let result = new ModelValidationResult();

    if (meta.args) {
        let operation: IModelOperation = {
            operation: 'validateArgs'
        };
        for (let field of meta.args) {
            promises.push(field.validate(models, args, operation, result));
        }
    }

    if (promises.length) {
        return Promise.all(promises)
            .then(() => {
                return result;
            });
    }
    else {
        return Promise.resolve(result);
    }

}