import { WrappedFieldProps } from 'redux-form';
import { IModelMeta, fields } from 'rev-models';

export interface IModelFieldCustomProps  {
    modelMeta: IModelMeta<any>;
    field: fields.Field;
}

export type IModelFieldComponentProps = IModelFieldCustomProps & WrappedFieldProps;
