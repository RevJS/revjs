import { IModelMeta, fields } from 'rev-models';
import { IFieldError } from 'rev-models/lib/validation/validationresult';

export interface IModelFieldComponentProps  {
    modelMeta: IModelMeta<any>;
    field: fields.Field;
    value: any;
    errors: IFieldError[];
    onChange: (value: any) => void;
    onFocus: () => void;
    onBlur: () => void;
}
