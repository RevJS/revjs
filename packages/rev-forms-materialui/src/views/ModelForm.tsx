
import * as React from 'react';
import * as PropTypes from 'prop-types';

import Grid from 'material-ui/Grid';
import { IModelProviderContext } from '../provider/ModelProvider';
import { IFieldError, IModelError, ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { ModelManager, IModelMeta } from 'rev-models';

export interface IModelFormProps {
    model: string;
}

export interface IModelFormState {
    fieldValues: {
        [fieldName: string]: any
    };
    fieldErrors: {
        [fieldName: string]: IFieldError[]
    };
    dirtyFields: {
        [fieldName: string]: boolean;
    };
    valid: boolean;
    disabled: boolean;
    modelErrors: IModelError[];
}

export interface IModelFormReceivedContext {
    modelManager: ModelManager;
}

export interface IModelFormProvidedContext {
    modelForm: ModelForm;
}

export class ModelForm extends React.Component<IModelFormProps, IModelFormState> {

    context: IModelFormReceivedContext;
    static contextTypes = {
        modelManager: PropTypes.object
    };

    modelMeta: IModelMeta<any>;

    constructor(props: IModelFormProps, context: IModelProviderContext) {
        super(props, context);
        if (!this.context.modelManager) {
            throw new Error('ModelForm Error: must be nested inside a ModelProvider.');
        }
        if (!props.model || !this.context.modelManager.isRegistered(props.model)) {
            throw new Error(`ModelForm Error: Model '${props.model}' is not registered.`);
        }
        this.modelMeta = this.context.modelManager.getModelMeta(this.props.model);
        this.state = {
            valid: false,
            disabled: false,
            fieldValues: {},
            fieldErrors: {},
            dirtyFields: {},
            modelErrors: []
        };
    }

    render() {
        return (
            <form onSubmit={(e) => e.preventDefault()}>
                <Grid container spacing={8}>
                    {this.props.children}
                </Grid>
            </form>
        );
    }

    updateFieldValue(fieldName: string, value: string) {
        const fieldValues = { ...this.state.fieldValues, [fieldName]: value};
        const fieldErrors = { ...this.state.fieldErrors };
        delete fieldErrors[fieldName];
        const dirtyFields = { ...this.state.dirtyFields, [fieldName]: true };
        this.setState({
            fieldValues,
            fieldErrors,
            dirtyFields
        });
    }

    updateValidationState(validationResult: ModelValidationResult) {
        this.setState({
            valid: validationResult.valid,
            fieldErrors: validationResult.fieldErrors,
            modelErrors: validationResult.modelErrors
        });
    }

    async validate() {
        const model = this.context.modelManager.hydrate(this.modelMeta.ctor, this.state.fieldValues);
        return this.context.modelManager.validate(model);
    }

    disable(isDisabled: boolean) {
        this.setState({
            disabled: isDisabled
        });
    }

    static childContextTypes = {
        modelForm: PropTypes.object
    };

    getChildContext(): IModelFormProvidedContext {
        return {
            modelForm: this
        };
    }
}
