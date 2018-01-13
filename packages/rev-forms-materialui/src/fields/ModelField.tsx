
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { ModelManager, IModelMeta, fields } from 'rev-models';

import Grid from 'material-ui/Grid';
import { TextField } from './TextField';
import { BooleanField } from './BooleanField';
import { DateField } from './DateField';
import { NumberField } from './NumberField';
import { SelectionField } from './SelectionField';
import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelFormProvidedContext, ModelForm } from '../forms/ModelForm';
import { IModelFieldComponentProps } from './types';
import { IFieldError } from 'rev-models/lib/validation/validationresult';

export interface IModelFieldProps {
    name: string;
    colspanNarrow?: number;
    colspan?: number;
    colspanWide?: number;
}

export interface IFormFieldContext {
    modelForm: ModelForm;
    modelManager: ModelManager;
}

export class ModelField extends React.Component<IModelFieldProps> {

    context: IFormFieldContext;
    static contextTypes = {
        modelManager: PropTypes.object,
        modelForm: PropTypes.object
    };

    modelMeta: IModelMeta<any>;
    modelField: fields.Field;

    constructor(props: IModelFieldProps, context: IModelProviderContext & IModelFormProvidedContext) {
        super(props, context);
        if (!this.context.modelForm) {
            throw new Error('ModelField Error: must be nested inside a ModelForm.');
        }
        this.modelMeta = this.context.modelManager.getModelMeta(this.context.modelForm.props.model);
        if (!(props.name in this.modelMeta.fieldsByName)) {
            throw new Error(`ModelField Error: Model '${this.context.modelForm.props.model}' does not have a field called '${props.name}'.`);
        }
        this.modelField = this.modelMeta.fieldsByName[props.name];
    }

    onFocus() {}
    onBlur() {}

    onChange(value: any) {
        this.context.modelForm.updateFieldValue(this.modelField.name, value);
    }

    render() {

        let fieldErrors: IFieldError[] = [];
        if (this.modelField.name in this.context.modelForm.state.fieldErrors) {
            fieldErrors = this.context.modelForm.state.fieldErrors[this.modelField.name];
        }

        let modelFieldProps: IModelFieldComponentProps = {
            modelMeta: this.modelMeta,
            field: this.modelField,
            value: this.context.modelForm.state.fieldValues[this.modelField.name],
            errors: fieldErrors,
            disabled: this.context.modelForm.state.disabled,
            onFocus: () => this.onFocus(),
            onBlur: () => this.onBlur(),
            onChange: (value) => this.onChange(value)
        };

        let component: React.ReactNode;

        if (this.modelField instanceof fields.TextField) {
            component = <TextField {...modelFieldProps} />;
        }
        else if (this.modelField instanceof fields.NumberField) {
            component = <NumberField {...modelFieldProps} />;
        }
        else if (this.modelField instanceof fields.BooleanField) {
            component = <BooleanField {...modelFieldProps} />;
        }
        else if (this.modelField instanceof fields.SelectionField) {
            component = <SelectionField {...modelFieldProps} />;
        }
        else if (this.modelField instanceof fields.DateField) {
            component = <DateField {...modelFieldProps} />;
        }

        const widthProps: any = {
            xs: this.props.colspanNarrow || 12,
            md: this.props.colspan || 6,
        };
        if (this.props.colspanWide) {
            widthProps.lg = this.props.colspanWide;
        }

        return <Grid item {...widthProps}>{component}</Grid>;

    }

}
