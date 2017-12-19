
import { ModelApiManager } from '../../api/manager';

export function getModelResolver(manager: ModelApiManager, modelName: string) {
    let models = manager.modelManager;
    let modelMeta = models.getModelMeta(modelName);

    return (value: any, args: any, context: any): Promise<any> => {

        return models.read(modelMeta.ctor, {})
            .then((res) => {
                return res.results;
            });

    };
}
