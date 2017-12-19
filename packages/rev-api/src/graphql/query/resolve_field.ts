
import { IModelMeta } from 'rev-models';

export function getFieldResolver(meta: IModelMeta<any>, fieldName: string) {

    return (value: any, args: any, context: any) => {

        return value[fieldName];

    };
}
