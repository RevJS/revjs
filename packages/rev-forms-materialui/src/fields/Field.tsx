
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { IModelMeta, fields } from 'rev-models';

import Grid from 'material-ui/Grid';
import { TextField } from './TextField';
import { BooleanField } from './BooleanField';
import { DateField } from './DateField';
import { NumberField } from './NumberField';
import { SelectionField } from './SelectionField';
import { IModelProviderContext } from '../provider/ModelProvider';
import { IFormViewContext } from '../views/FormView';
import { IModelFieldComponentProps } from './types';
import { IFieldError } from 'rev-models/lib/validation/validationresult';

export interface IFieldProps {
    name: string;
    colspanNarrow?: number;
    colspan?: number;
    colspanWide?: number;
}

export interface IFieldState {
    value: any;
}

export class Field extends React.Component<IFieldProps, IFieldState> {

    context: IModelProviderContext & IFormViewContext;
    static contextTypes = {
        modelManager: PropTypes.object,
        modelContext: PropTypes.object
    };

    modelMeta: IModelMeta<any>;
    modelField: fields.Field;

    constructor(props: IFieldProps, context: IModelProviderContext & IFormViewContext) {
        super(props, context);
        if (!this.context.modelContext) {
            throw new Error('Field Error: must be nested inside a FormView.');
        }
        this.modelMeta = this.context.modelContext.modelMeta;
        if (!(props.name in this.modelMeta.fieldsByName)) {
            throw new Error(`Field Error: Model '${this.modelMeta.name}' does not have a field called '${props.name}'.`);
        }
        this.modelField = this.modelMeta.fieldsByName[props.name];
    }

    onFocus() {}
    onBlur() {}

    onChange(value: any) {
        this.context.modelContext.model[this.modelField.name] = value;
        this.context.modelContext.setDirty(true);
        this.setState({ value });
    }

    render() {

        let fieldErrors: IFieldError[] = [];
        if (this.modelField.name in this.context.modelContext.validation.fieldErrors) {
            fieldErrors = this.context.modelContext.validation.fieldErrors[this.modelField.name];
        }

        let modelFieldProps: IModelFieldComponentProps = {
            modelMeta: this.modelMeta,
            field: this.modelField,
            value: this.context.modelContext.model[this.modelField.name],
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
