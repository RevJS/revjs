
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { ModelManager } from 'rev-models';
import * as fields from 'rev-models/lib/fields';

import { TextField } from './TextField';
import { BooleanField } from './BooleanField';
import { DateField } from './DateField';
import { NumberField } from './NumberField';
import { SelectionField } from './SelectionField';
import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelFormContext } from '../forms/ModelForm';
import { IModelFieldComponentProps } from './types';

export interface IModelFieldProps {
    name: string;
}

export class ModelField extends React.Component<IModelFieldProps> {

    static contextTypes = {
        modelManager: PropTypes.object,
        modelForm: PropTypes.object
    };

    modelFieldProps: IModelFieldComponentProps = {} as any;

    constructor(props: IModelFieldProps, context: IModelProviderContext & IModelFormContext) {
        super(props);
        let modelManager: ModelManager = context.modelManager;
        let modelForm = context.modelForm;
        if (!modelForm) {
            throw new Error('ModelField Error: must be nested inside a ModelForm.');
        }
        this.modelFieldProps.modelMeta = modelManager.getModelMeta(modelForm.props.model);
        if (!(props.name in this.modelFieldProps.modelMeta.fieldsByName)) {
            throw new Error(`ModelField Error: Model '${modelForm.props.model}' does not have a field called '${props.name}'.`);
        }
        this.modelFieldProps.field = this.modelFieldProps.modelMeta.fieldsByName[props.name];
        this.modelFieldProps.onFocus = () => null;
        this.modelFieldProps.onBlur = () => null;
        this.modelFieldProps.onChange = (value: any) => {
            console.log('onChange', value);
        };
    }

    render() {
        // TODO: Put these in an object so they can be replaced

        if (this.modelFieldProps.field instanceof fields.TextField) {
            return (
                <TextField {...this.modelFieldProps} />
            );
        }
        else if (this.modelFieldProps.field instanceof fields.NumberField) {
            return (
                <NumberField {...this.modelFieldProps} />
            );
        }
        else if (this.modelFieldProps.field instanceof fields.BooleanField) {
            return (
                <BooleanField {...this.modelFieldProps} />
            );
        }
        else if (this.modelFieldProps.field instanceof fields.SelectionField) {
            return (
                <SelectionField {...this.modelFieldProps} />
            );
        }
        else if (this.modelFieldProps.field instanceof fields.DateField) {
            return (
                <DateField {...this.modelFieldProps} />
            );
        }
    }

}
