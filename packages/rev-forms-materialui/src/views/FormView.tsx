
import * as React from 'react';
import * as PropTypes from 'prop-types';

import Grid from 'material-ui/Grid';
import { IModelProviderContext } from '../provider/ModelProvider';
import { IFieldError, IModelError, ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { IViewManagerContext } from './ViewManager';

export interface IFormViewProps {
    model: string;
}

export interface IFormViewState {
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

export interface IFormViewContext {
    modelForm: FormView;
}

export class FormView extends React.Component<IFormViewProps, IFormViewState> {

    context: IModelProviderContext & IViewManagerContext;
    static contextTypes = {
        modelManager: PropTypes.object,
        viewContext: PropTypes.object
    };

    constructor(props: IFormViewProps, context: IModelProviderContext) {
        super(props, context);
        if (!this.context.modelManager) {
            throw new Error('FormView Error: must be nested inside a ModelProvider.');
        }
        if (!this.context.viewContext) {
            throw new Error('FormView Error: must be nested inside a ViewManager.');
        }
        if (!props.model || !this.context.modelManager.isRegistered(props.model)) {
            throw new Error(`FormView Error: Model '${props.model}' is not registered.`);
        }
        const modelMeta = this.context.viewContext.modelMeta;
        if (modelMeta.name != props.model) {
            throw new Error('FormView Error: model prop must currently be the same as ViewManager model.');
        }
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
        this.context.viewContext.setDirty(true);
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
        const model = this.context.modelManager.hydrate(this.context.viewContext.modelMeta.ctor, this.state.fieldValues);
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

    getChildContext(): IFormViewContext {
        return {
            modelForm: this
        };
    }
}
