
import * as React from 'react';
import * as PropTypes from 'prop-types';

import Grid from 'material-ui/Grid';
import { IModelProviderContext } from '../provider/ModelProvider';
import { IViewManagerContext } from './ViewManager';

export interface IFormViewProps {
    model: string;
}

export interface IFormViewState {
    disabled: boolean;
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

    constructor(props: IFormViewProps, context: any) {
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
            disabled: false
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
