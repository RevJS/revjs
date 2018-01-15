import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModel, IModelMeta, IModelOperationResult } from 'rev-models';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';

export interface IViewManagerProps {
    model: string;
    primaryKeyValue?: string;
}

export type IViewLoadState = 'LOADING' | 'SAVING' | 'NONE';

export interface IViewContext {
    loadState: IViewLoadState;
    model: IModel;
    modelMeta: IModelMeta<any>;
    validation: ModelValidationResult;
    dirty: boolean;
    isNew(): boolean;
    setDirty(dirty: boolean): void;
    validate(): Promise<ModelValidationResult>;
    save(): IModelOperationResult<any, any>;
}

export interface IViewManagerContext {
    viewContext: IViewContext;
}

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

        // TODO: Based on whether there is a primaryKey value, either
        // trigger a load to fetch the specified model, or create a
        // new instance of the specified model

        this.viewContext = {
            loadState: 'NONE',
            model: null,
            modelMeta,
            validation: null,
            dirty: false,
            isNew: () => this.isNew(),
            setDirty: (dirty) => this.setDirty(dirty),
            validate: () => this.validate(),
            save: () => null
        };
        this.state = {
            dirty: false
        };
    }

    // initModel() {
    //     const ctx = this.viewContext;
    //     if (!ctx.model) {
    //         ctx.model = new ctx.modelMeta.ctor();
    //     }
    //     ctx.validation = new ModelValidationResult();
    //     this.setState({
    //         dirty: false
    //     });
    // }

    isNew() {
        const ctx = this.viewContext;
        return !ctx.model
            || typeof ctx.model[ctx.modelMeta.primaryKey] == 'undefined'
            || ctx.model[ctx.modelMeta.primaryKey] === null;
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
