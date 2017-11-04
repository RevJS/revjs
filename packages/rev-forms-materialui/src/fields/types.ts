import { IModelMeta, fields } from 'rev-models';

export interface IModelFieldComponentProps  {
    modelMeta: IModelMeta<any>;
    field: fields.Field;
    value: any;
    onChange: (value: any) => void;
    onFocus: () => void;
    onBlur: () => void;
}
