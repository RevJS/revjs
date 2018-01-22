
import * as React from 'react';
import { fields } from 'rev-models';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelContextProp } from '../views/DetailView';
import { IFieldError } from 'rev-models/lib/validation/validationresult';
import { withModelContext } from '../views/withModelContext';
import { UI_COMPONENTS } from '../config';

export interface IFieldProps {
    name: string;
    colspanNarrow?: number;
    colspan?: number;
    colspanWide?: number;

    component?: React.ComponentType<IFieldComponentProps>;
}

export interface IFieldState {
    value: any;
}

export interface IFieldComponentProps  {
    field: fields.Field;
    label: string;
    colspanNarrow: number;
    colspan: number;
    colspanWide: number;
    value: any;
    errors: IFieldError[];
    disabled: boolean;
    onChange: (value: any) => void;
}

class FieldC extends React.Component<IFieldProps & IModelContextProp, IFieldState> {

    modelField: fields.Field;

    constructor(props: IFieldProps & IModelContextProp, context: IModelProviderContext & IModelContextProp) {
        super(props, context);
        if (!this.props.modelContext) {
            throw new Error('Field Error: must be nested inside a DetailView.');
        }
        const meta = this.props.modelContext.modelMeta;
        if (!(props.name in meta.fieldsByName)) {
            throw new Error(`Field Error: Model '${meta.name}' does not have a field called '${props.name}'.`);
        }
        this.modelField = meta.fieldsByName[props.name];
    }

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
        const disabled = this.props.modelContext.loadState != 'NONE';

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

        const fieldComponentName = this.modelField.constructor.name;

        const Component = this.props.component || UI_COMPONENTS.fields[fieldComponentName];
        return <Component {...cProps} />;

    }

}

export const Field = withModelContext(FieldC);
