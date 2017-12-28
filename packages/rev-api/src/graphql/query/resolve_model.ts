
import { IModelApiManager } from '../../api/types';

export function getModelResolver(manager: IModelApiManager, modelName: string) {
    let models = manager.getModelManager();
    let modelMeta = models.getModelMeta(modelName);

    return (value: any, args: any, context: any): Promise<any> => {

        return models.read(modelMeta.ctor, {})
            .then((res) => {
                return res.results;
            });

    };
}
