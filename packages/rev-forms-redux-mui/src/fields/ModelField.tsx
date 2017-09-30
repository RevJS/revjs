
import * as React from 'react';
import { Field } from 'redux-form';
import { ModelManager } from 'rev-models';
import * as fields from 'rev-models/lib/fields';
import { IModelFieldComponentProps } from './types';

import TextField from './TextField';
import BooleanField from './BooleanField';
import DateField from './DateField';
import NumberField from './NumberField';
import SelectionField from './SelectionField';
import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelFormContext } from '../forms/ModelForm';

export interface IModelFieldProps {
    name: string;
}

export class ModelField extends React.Component<IModelFieldProps, void> {

    static contextTypes = {
        modelManager: React.PropTypes.object,
        modelForm: React.PropTypes.object
    };

    fieldComponentProps: IModelFieldComponentProps = {} as any;

    constructor(props: IModelFieldProps, context: IModelProviderContext & IModelFormContext) {
        super(props);
        let modelManager: ModelManager = context.modelManager;
        let modelFormMeta = context.modelForm;
        if (!modelFormMeta) {
            throw new Error('ModelField Error: must be nested inside a ModelForm.');
        }
        this.fieldComponentProps.modelMeta = modelManager.getModelMeta(modelFormMeta.model);
        if (!(props.name in this.fieldComponentProps.modelMeta.fieldsByName)) {
            throw new Error(`ModelField Error: Model '${modelFormMeta.model}' does not have a field called '${props.name}'.`);
        }
        this.fieldComponentProps.field = this.fieldComponentProps.modelMeta.fieldsByName[props.name];
    }

    render() {
        // TODO: Put these in an object so they can be replaced

        if (this.fieldComponentProps.field instanceof fields.TextField) {
            return (
                <Field name={this.props.name} component={TextField} props={this.fieldComponentProps} />
            );
        }
        else if (this.fieldComponentProps.field instanceof fields.NumberField) {
            return (
                <Field name={this.props.name} component={NumberField} props={this.fieldComponentProps} />
            );
        }
        else if (this.fieldComponentProps.field instanceof fields.BooleanField) {
            return (
                <Field name={this.props.name} component={BooleanField} props={this.fieldComponentProps} />
            );
        }
        else if (this.fieldComponentProps.field instanceof fields.SelectionField) {
            return (
                <Field name={this.props.name} component={SelectionField} props={this.fieldComponentProps} />
            );
        }
        else if (this.fieldComponentProps.field instanceof fields.DateField) {
            return (
                <Field name={this.props.name} component={DateField} props={this.fieldComponentProps} />
            );
        }
    }

}
