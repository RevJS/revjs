
import * as React from 'react';
import { fields } from 'rev-models';

import { IDetailViewContextProp } from '../views/DetailView';
import { IFieldError } from 'rev-models/lib/validation/validationresult';
import { withDetailViewContext } from '../views/withDetailViewContext';
import { UI_COMPONENTS } from '../config';
import { IStandardComponentProps, getStandardProps } from '../utils/props';

/**
 * @private
 */
export type ColspanOptions = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * The `<Field />` component is designed to be included in a `<DetailView />`.
 * When passed the name of a model field, it will render an appropriate input
 * field to allow the value of the field to be modified.
 *
 * If any validation errors occur, a `<Field />` will display the corresponding
 * validation message(s) and allow the error to be corrected.
 */
export interface IFieldProps extends IStandardComponentProps {

    /**
     * Model field name. Must correspond with a field on the model specified
     * for the `<DetailView />` component
     */
    name: string;

    /** How many columns to span for narrow screens (1-12). Default = 12 */
    colspanNarrow?: ColspanOptions;

    /** How many columns to span for normal screens (1-12). Default = 6 */
    colspan?: ColspanOptions;

    /** How many columns to span for wide screens (1-12). Default = 6 */
    colspanWide?: ColspanOptions;

    /**
     * If you provide a React component to this property, it will be used
     * instead of the component configured in [[UI_COMPONENTS]] for the
     * corresponding Field type. This component will be passed
     * [[IFieldComponentProps]]
     */
    component?: React.ComponentType<IFieldComponentProps>;
}

/**
 * @private
 */
export interface IFieldState {
    value: any;
}

/**
 * @private
 */
export interface IFieldComponentProps extends IStandardComponentProps  {
    field: fields.Field;
    label: string;
    colspanNarrow: ColspanOptions;
    colspan: ColspanOptions;
    colspanWide: ColspanOptions;
    value: any;
    errors: IFieldError[];
    disabled: boolean;
    onChange: (value: any) => void;
}

class FieldC extends React.Component<IFieldProps & IDetailViewContextProp, IFieldState> {

    parentFieldName: string | null;
    modelField: fields.Field;
    fieldComponentName: string;

    constructor(props: IFieldProps & IDetailViewContextProp) {
        super(props);
        if (!this.props.detailViewContext) {
            throw new Error('Field Error: must be nested inside a DetailView.');
        }
        const meta = this.props.detailViewContext.modelMeta;
        const tokens = props.name.split('.');
        if (tokens.length > 2) {
            throw new Error(`Field Error: invalid field '${props.name}'. Currently only 2 levels of field hierarchy are supported.`);
        }
        else if (tokens.length == 2) {
            const [parentField, subField] = tokens;
            const relMeta = this.props.detailViewContext.relatedModelMeta;
            if (!(parentField in relMeta)) {
                throw new Error(`Field Error: invalid field '${props.name}'. Related field '${parentField}' is not selected in parent DetailView.`);
            }
            else if (!(subField in relMeta[parentField].fieldsByName)) {
                throw new Error(`Field Error: invalid field '${props.name}'. Field '${subField}' does not exist on model '${relMeta[parentField].name}'.`);
            }
            this.parentFieldName = parentField;
            this.modelField = relMeta[parentField].fieldsByName[subField];
        }
        else {
            if (!(props.name in meta.fieldsByName)) {
                throw new Error(`Field Error: Model '${meta.name}' does not have a field called '${props.name}'.`);
            }
            this.parentFieldName = null;
            this.modelField = meta.fieldsByName[props.name];
        }
        this.fieldComponentName = this.modelField.constructor.name;
        if (!this.props.component && !UI_COMPONENTS.fields[this.fieldComponentName]) {
            throw new Error(`Field Error: There is no UI_COMPONENT registered for field type '${this.fieldComponentName}'`);
        }
    }

    onChange(value: any) {
        this.props.detailViewContext.model![this.modelField.name] = value;
        this.props.detailViewContext.setDirty(true);
        this.setState({ value });
    }

    render() {

        const ctx = this.props.detailViewContext;
        let fieldErrors: IFieldError[] = [];
        if (ctx.validation
            && this.modelField.name in ctx.validation.fieldErrors) {
            fieldErrors = ctx.validation.fieldErrors[this.modelField.name];
        }
        const disabled = this.props.detailViewContext.loadState != 'NONE';

        let cProps: IFieldComponentProps = {
            field: this.modelField,
            label: this.modelField.options.label || this.modelField.name,
            colspanNarrow: this.props.colspanNarrow || 12,
            colspan: this.props.colspan || 6,
            colspanWide: this.props.colspanWide || this.props.colspan || 6,
            value: ctx.model ? ctx.model[this.modelField.name] : undefined,
            errors: fieldErrors,
            disabled,
            onChange: (value) => this.onChange(value)
        };
        const sProps = getStandardProps(this.props);

        const Component = this.props.component || UI_COMPONENTS.fields[this.fieldComponentName];
        return <Component {...cProps} {...sProps} />;

    }

}

/**
 * See [[IFieldProps]]
 * @private
 */
export const Field = withDetailViewContext(FieldC);
