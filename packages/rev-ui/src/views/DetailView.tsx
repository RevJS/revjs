import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModel, IModelMeta, IModelManager, ValidationError } from 'rev-models';
import { IModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { isSet } from 'rev-models/lib/utils';
import { UI_COMPONENTS } from '../config';
import { IModelOperationResult } from 'rev-models/lib/operations/operationresult';

export interface IDetailViewProps {
    model: string;
    primaryKeyValue?: string;
    component?: React.ComponentType;
}

export type IModelLoadState = 'NONE' | 'LOADING' | 'SAVING' ;

export interface IModelContext<T extends IModel = IModel> {
    loadState: IModelLoadState;
    manager: IModelManager;
    model: T;
    modelMeta: IModelMeta<T>;
    validation: IModelValidationResult;
    dirty: boolean;
    setLoadState(state: IModelLoadState): void;
    setDirty(dirty: boolean): void;
    validate(): Promise<IModelValidationResult>;
    save(): Promise<IModelOperationResult<T, any>>;
    remove(): Promise<IModelOperationResult<T, any>>;
    refresh(): void;
}

export interface IModelContextProp<T extends IModel = IModel> {
    modelContext: IModelContext<T>;
}

export class DetailView extends React.Component<IDetailViewProps> {

    context: IModelProviderContext;
    static contextTypes = {
        modelManager: PropTypes.object
    };

    modelContext: IModelContext;

    constructor(props: IDetailViewProps, context: any) {
        super(props, context);

        if (!this.context.modelManager) {
            throw new Error('DetailView Error: must be nested inside a ModelProvider.');
        }
        const modelMeta = this.context.modelManager.getModelMeta(this.props.model);

        if (!modelMeta.primaryKey) {
            throw new Error(`DetailView Error: model '${modelMeta.name}' does not have a primaryKey field defined.`);
        }

        this.modelContext = {
            loadState: 'NONE',
            manager: this.context.modelManager,
            model: null,
            modelMeta,
            validation: null,
            dirty: false,
            setLoadState: (state) => this.setLoadState(state),
            setDirty: (dirty) => this.setDirty(dirty),
            validate: () => this.validate(),
            save: () => this.save(),
            remove: () => this.remove(),
            refresh: () => this.forceUpdate()
        };

        if (isSet(props.primaryKeyValue)) {
            this.loadModel();
        }
        else {
            this.setModel(new modelMeta.ctor());
        }
    }

    async loadModel() {
        this.modelContext.loadState = 'LOADING';
        const meta = this.modelContext.modelMeta;
        const result = await this.context.modelManager.read(
            meta.ctor,
            {
                where: {
                    [meta.primaryKey]: this.props.primaryKeyValue
                },
                limit: 1
            }
        );
        if (this.modelContext.loadState == 'LOADING') {
            this.modelContext.loadState = 'NONE';
            if (result.results.length == 1) {
                this.setModel(result.results[0]);
                this.forceUpdate();
            }
        }
    }

    setModel(model: IModel) {
        this.modelContext.model = model;
        this.modelContext.dirty = false;
        this.modelContext.validation = null;
    }

    setLoadState(state: IModelLoadState) {
        if (state != this.modelContext.loadState) {
            this.modelContext.loadState = state;
            this.forceUpdate();
        }
    }

    setDirty(dirty: boolean) {
        if (dirty != this.modelContext.dirty) {
            this.modelContext.dirty = dirty;
            this.forceUpdate();
        }
    }

    async validate() {
        const ctx = this.modelContext;
        ctx.validation = await this.context.modelManager.validate(ctx.model);
        this.forceUpdate();
        return ctx.validation;
    }

    async save() {
        const ctx = this.modelContext;
        let result: IModelOperationResult<any, any>;
        try {
            if (ctx.manager.isNew(ctx.model)) {
                result = await ctx.manager.create(ctx.model);
            }
            else {
                result = await ctx.manager.update(ctx.model);
            }
        }
        catch (e) {
            if (e instanceof ValidationError) {
                ctx.validation = e.validation;
                this.forceUpdate();
            }
            throw e;
        }
        ctx.validation = result.validation;
        this.forceUpdate();
        return result;
    }

    async remove(): Promise<any> {
        const ctx = this.modelContext;
        let result: IModelOperationResult<any, any>;
        if (ctx.manager.isNew(ctx.model)) {
            throw new Error('Cannot call remove() on a new model record.');
        }
        else {
            result = await ctx.manager.remove(ctx.model);
        }
        this.setModel(new ctx.modelMeta.ctor());
        this.forceUpdate();
        return result;
    }

    static childContextTypes = {
        modelContext: PropTypes.object
    };

    getChildContext(): IModelContextProp {
        return {
            modelContext: this.modelContext
        };
    }

    render() {
        const Component = this.props.component || UI_COMPONENTS.views.DetailView;
        return <Component {...this.props} />;
    }
}
