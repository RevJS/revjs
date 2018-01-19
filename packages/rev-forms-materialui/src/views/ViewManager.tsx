import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModel, IModelMeta, IModelOperationResult } from 'rev-models';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { isSet } from '../utils';

export interface IViewManagerProps {
    model: string;
    primaryKeyValue?: string;
}

export type IViewLoadState = 'NONE' | 'LOADING' | 'SAVING' ;

export interface IViewContext {
    loadState: IViewLoadState;
    model: IModel;
    modelMeta: IModelMeta<any>;
    validation: ModelValidationResult;
    dirty: boolean;
    setDirty(dirty: boolean): void;
    validate(): Promise<ModelValidationResult>;
}

export interface IViewManagerContext {
    viewContext: IViewContext;
}

/**
 * Wrapper object that enables multiple sub-views to view / modify
 * the same model instance information
 *
 * if the primaryKeyValue property is specified, that model is loaded
 * when the component is initialised. Otherwise viewContext.model is
 * set to a new model instance
 */
export class ViewManager extends React.Component<IViewManagerProps> {

    context: IModelProviderContext;
    static contextTypes = {
        modelManager: PropTypes.object
    };

    viewContext: IViewContext;

    constructor(props: IViewManagerProps, context: any) {
        super(props, context);

        if (!this.context.modelManager) {
            throw new Error('ViewManager Error: must be nested inside a ModelProvider.');
        }
        const modelMeta = this.context.modelManager.getModelMeta(this.props.model);
        if (!modelMeta.primaryKey) {
            throw new Error('ViewManager Error: can only be used with models that have a primaryKey');
        }

        this.viewContext = {
            loadState: 'NONE',
            model: null,
            modelMeta,
            validation: null,
            dirty: false,
            setDirty: (dirty) => this.setDirty(dirty),
            validate: () => this.validate()
        };

        if (isSet(props.primaryKeyValue)) {
            this.loadModel();
        }
        else {
            this.setModel(new modelMeta.ctor());
        }
    }

    async loadModel() {
        this.viewContext.loadState = 'LOADING';
        const meta = this.viewContext.modelMeta;
        const result = await this.context.modelManager.read(
            meta.ctor,
            { [meta.primaryKey]: this.props.primaryKeyValue },
            { limit: 1 }
        );
        if (this.viewContext.loadState == 'LOADING') {
            this.viewContext.loadState = 'NONE';
            if (result.results.length == 1) {
                this.setModel(result.results[0]);
            }
        }
    }

    setModel(model: IModel) {
        this.viewContext.model = model;
        this.viewContext.dirty = false;
    }

    setDirty(dirty: boolean) {
        if (dirty != this.viewContext.dirty) {
            this.viewContext.dirty = dirty;
            this.forceUpdate();
        }
    }

    async validate() {
        const ctx = this.viewContext;
        ctx.validation = await this.context.modelManager.validate(ctx.model);
        this.forceUpdate();
        return ctx.validation;
    }

    static childContextTypes = {
        viewContext: PropTypes.object
    };

    getChildContext(): IViewManagerContext {
        return {
            viewContext: this.viewContext
        };
    }

    render() {
        return this.props.children;
    }
}
