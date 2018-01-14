import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModel, IModelMeta, IModelOperationResult } from 'rev-models';
import { ModelValidationResult } from 'rev-models/lib/validation/validationresult';

export interface IViewManagerProps {
    model: string;
    primaryKeyValue?: string;
}

export interface IViewManagerState {
    dirty: boolean;
}

export interface IViewContext {
    model: IModel;
    modelMeta: IModelMeta<any>;
    validation: ModelValidationResult;
    dirty: boolean;
    initModel(model?: IModel): void;
    isNew(): boolean;
    setDirty(dirty: boolean): void;
    validate(): Promise<ModelValidationResult>;
    save(): IModelOperationResult<any, any>;
}

export interface IViewManagerContext {
    viewContext: IViewContext;
}

export class ViewManager extends React.Component<IViewManagerProps, IViewManagerState> {

    context: IModelProviderContext;
    static contextTypes = {
        modelManager: PropTypes.object
    };

    viewContext: IViewContext;

    constructor(props: IViewManagerProps, context: any) {
        super(props, context);

        const modelMeta = this.context.modelManager.getModelMeta(this.props.model);
        if (!modelMeta.primaryKey) {
            throw new Error('ViewManager Error: can only be used with models with a primaryKey defined');
        }

        this.viewContext = {
            model: null,
            modelMeta,
            validation: null,
            dirty: false,
            initModel: (model) => this.initModel(model),
            isNew: () => this.isNew(),
            setDirty: (dirty) => this.setDirty(dirty),
            validate: () => this.validate(),
            save: () => null
        };
        this.state = {
            dirty: false
        };
    }

    initModel(model?: IModel) {
        const ctx = this.viewContext;
        if (model || !ctx.model) {
            if (model) {
                ctx.model = model;
            }
            else {
                ctx.model = new ctx.modelMeta.ctor();
                ctx.model[ctx.modelMeta.primaryKey] = this.props.primaryKeyValue;
            }
            ctx.validation = new ModelValidationResult();
            this.setState({
                dirty: false
            });
        }
    }

    isNew() {
        const ctx = this.viewContext;
        return !ctx.model || typeof ctx.model[ctx.modelMeta.primaryKey] == 'undefined';
    }

    setDirty(dirty: boolean) {
        if (dirty != this.viewContext.dirty) {
            this.setState({ dirty });
            this.viewContext.dirty = dirty;
        }
    }

    async validate() {
        const ctx = this.viewContext;
        ctx.validation = await this.context.modelManager.validate(ctx.model);
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
