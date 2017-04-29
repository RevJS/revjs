import { IModelMeta } from 'rev-models';
import { fields } from 'rev-models';

export interface IReduxFormInputProps {
    name: string;
    onBlur: any;
    onChange: any;
    onDragStart: any;
    onDrop: any;
    onFocus: any;
    value: any;
}

export interface IReduxFormMetaProps {
    active?: boolean;
    autofilled: boolean;
    asyncValidating: boolean;
    dirty: boolean;
    dispatch: (action: any) => void;
    error?: string;
    invalid: boolean;
    pristine: boolean;
    touched: boolean;
    valid: boolean;
    visited?: boolean;
    warning?: string;
}

export interface IModelFieldTypeProps {
    input: IReduxFormInputProps;
    meta: IReduxFormMetaProps;
    modelMeta: IModelMeta<any>;
    field: fields.Field;
}

export interface IModelFieldComponentProps {
    modelMeta: IModelMeta<any>;
    field: fields.Field;
}
