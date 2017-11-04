
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { ModelManager, IModelMeta, fields } from 'rev-models';

import { TextField } from './TextField';
import { BooleanField } from './BooleanField';
import { DateField } from './DateField';
import { NumberField } from './NumberField';
import { SelectionField } from './SelectionField';
import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelFormContext, ModelForm } from '../forms/ModelForm';
import { IModelFieldComponentProps } from './types';

export interface IModelFieldProps {
    name: string;
}

export class ModelField extends React.Component<IModelFieldProps> {

    static contextTypes = {
        modelManager: PropTypes.object,
        modelForm: PropTypes.object
    };

    modelManager: ModelManager;
    modelForm: ModelForm;
    modelMeta: IModelMeta<any>;
    modelField: fields.Field;

    constructor(props: IModelFieldProps, context: IModelProviderContext & IModelFormContext) {
        super(props);
        this.modelManager = context.modelManager;
        this.modelForm = context.modelForm;
        if (!this.modelForm) {
            throw new Error('ModelField Error: must be nested inside a ModelForm.');
        }
        this.modelMeta = this.modelManager.getModelMeta(this.modelForm.props.model);
        if (!(props.name in this.modelMeta.fieldsByName)) {
            throw new Error(`ModelField Error: Model '${this.modelForm.props.model}' does not have a field called '${props.name}'.`);
        }
        this.modelField = this.modelMeta.fieldsByName[props.name];
    }

    onFocus() {}
    onBlur() {}

    onChange(value: any) {
        this.modelForm.updateFieldValue(this.modelField.name, value);
    }

    render() {
        // TODO: Put these in an object so they can be replaced

        let modelFieldProps: IModelFieldComponentProps = {
            modelMeta: this.modelMeta,
            field: this.modelField,
            value: this.modelForm.state.formValues[this.modelField.name],
            onFocus: () => this.onFocus(),
            onBlur: () => this.onBlur(),
            onChange: (value) => this.onChange(value)
        };


        if (this.modelField instanceof fields.TextField) {
            return (
                <TextField {...modelFieldProps} />
            );
        }
        else if (this.modelField instanceof fields.NumberField) {
            return (
                <NumberField {...modelFieldProps} />
            );
        }
        else if (this.modelField instanceof fields.BooleanField) {
            return (
                <BooleanField {...modelFieldProps} />
            );
        }
        else if (this.modelField instanceof fields.SelectionField) {
            return (
                <SelectionField {...modelFieldProps} />
            );
        }
        else if (this.modelField instanceof fields.DateField) {
            return (
                <DateField {...modelFieldProps} />
            );
        }
    }

}
