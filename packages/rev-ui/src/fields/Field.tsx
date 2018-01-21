
import * as React from 'react';
import { fields } from 'rev-models';

import Grid from 'material-ui/Grid';
import { TextField } from './TextField';
import { BooleanField } from './BooleanField';
import { DateField } from './DateField';
import { NumberField } from './NumberField';
import { SelectField } from './SelectionField';
import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelContextProp } from '../views/DetailView';
import { IFieldComponentProps } from './types';
import { IFieldError } from 'rev-models/lib/validation/validationresult';
import { withModelContext } from '../views/withModelContext';

export interface IFieldProps {
    name: string;
    colspanNarrow?: number;
    colspan?: number;
    colspanWide?: number;
}

export interface IFieldState {
    value: any;
}

class FieldC extends React.Component<IFieldProps & IModelContextProp, IFieldState> {

    modelField: fields.Field;

    constructor(props: IFieldProps & IModelContextProp, context: IModelProviderContext & IModelContextProp) {
        super(props, context);
        if (!this.props.modelContext) {
            throw new Error('Field Error: must be nested inside a FormView.');
        }
        const meta = this.props.modelContext.modelMeta;
        if (!(props.name in meta.fieldsByName)) {
            throw new Error(`Field Error: Model '${meta.name}' does not have a field called '${props.name}'.`);
        }
        this.modelField = meta.fieldsByName[props.name];
    }

    onFocus() {}
    onBlur() {}

    onChange(value: any) {
        this.props.modelContext.model[this.modelField.name] = value;
        this.props.modelContext.setDirty(true);
        this.setState({ value });
    }

    render() {

        const ctx = this.props.modelContext;
        let fieldErrors: IFieldError[] = [];
        if (ctx.validation
            && this.modelField.name in ctx.validation.fieldErrors) {
            fieldErrors = ctx.validation.fieldErrors[this.modelField.name];
        }

        let modelFieldProps: IFieldComponentProps = {
            modelMeta: ctx.modelMeta,
            field: this.modelField,
            value: ctx.model ? ctx.model[this.modelField.name] : null,
            errors: fieldErrors,
            disabled: false,  // TODO
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
        else if (this.modelField instanceof fields.SelectField) {
            component = <SelectField {...modelFieldProps} />;
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

export const Field = withModelContext(FieldC);
