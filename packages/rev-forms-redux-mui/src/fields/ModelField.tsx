
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Field, GenericField } from 'redux-form';
import { ModelManager } from 'rev-models';
import * as fields from 'rev-models/lib/fields';

import { TextField } from './TextField';
import { BooleanField } from './BooleanField';
import { DateField } from './DateField';
import { NumberField } from './NumberField';
import { SelectionField } from './SelectionField';
import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelFormContext } from '../forms/ModelForm';
import { IModelFieldCustomProps } from './types';

export interface IModelFieldProps {
    name: string;
}

const ModelFieldWrapper = Field as new () => GenericField<IModelFieldCustomProps>;

export class ModelField extends React.Component<IModelFieldProps> {

    static contextTypes = {
        modelManager: PropTypes.object,
        modelForm: PropTypes.object
    };

    modelFieldProps: IModelFieldCustomProps = {} as any;

    constructor(props: IModelFieldProps, context: IModelProviderContext & IModelFormContext) {
        super(props);
        let modelManager: ModelManager = context.modelManager;
        let modelFormMeta = context.modelForm;
        if (!modelFormMeta) {
            throw new Error('ModelField Error: must be nested inside a ModelForm.');
        }
        this.modelFieldProps.modelMeta = modelManager.getModelMeta(modelFormMeta.model);
        if (!(props.name in this.modelFieldProps.modelMeta.fieldsByName)) {
            throw new Error(`ModelField Error: Model '${modelFormMeta.model}' does not have a field called '${props.name}'.`);
        }
        this.modelFieldProps.field = this.modelFieldProps.modelMeta.fieldsByName[props.name];
    }

    render() {
        // TODO: Put these in an object so they can be replaced

        if (this.modelFieldProps.field instanceof fields.TextField) {
            return (
                <ModelFieldWrapper name={this.props.name} component={TextField}
                    modelMeta={this.modelFieldProps.modelMeta}
                    field={this.modelFieldProps.field} />
            );
        }
        else if (this.modelFieldProps.field instanceof fields.NumberField) {
            return (
                <ModelFieldWrapper name={this.props.name} component={NumberField}
                    modelMeta={this.modelFieldProps.modelMeta}
                    field={this.modelFieldProps.field} />
            );
        }
        else if (this.modelFieldProps.field instanceof fields.BooleanField) {
            return (
                <ModelFieldWrapper name={this.props.name} component={BooleanField}
                    modelMeta={this.modelFieldProps.modelMeta}
                    field={this.modelFieldProps.field} />
            );
        }
        else if (this.modelFieldProps.field instanceof fields.SelectionField) {
            return (
                <ModelFieldWrapper name={this.props.name} component={SelectionField}
                    modelMeta={this.modelFieldProps.modelMeta}
                    field={this.modelFieldProps.field} />
            );
        }
        else if (this.modelFieldProps.field instanceof fields.DateField) {
            return (
                <ModelFieldWrapper name={this.props.name} component={DateField}
                    modelMeta={this.modelFieldProps.modelMeta}
                    field={this.modelFieldProps.field} />
            );
        }
    }

}
