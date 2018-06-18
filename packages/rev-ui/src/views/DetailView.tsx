import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModel, IModelMeta, IModelManager, ValidationError } from 'rev-models';
import { IModelValidationResult, ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { isSet } from 'rev-models/lib/utils';
import { UI_COMPONENTS } from '../config';
import { IModelOperationResult } from 'rev-models/lib/operations/operationresult';
import { IStandardComponentProps } from '../utils/props';
import { RelatedModelField } from 'rev-models/lib/fields';
import { IReadOptions } from 'rev-models/lib/models/types';

/**
 * A `<DetailView />` renders a single model record. When used in conjunction
 * with `<Field />` components then it allows the properties of the record to
 * be edited by the user.
 *
 * A `<DetailView />` component provides its sub-components with access to
 * [[IDetailViewContext]] to allow them to read and update the current model
 * information. You can connect your own components to IDetailViewContext
 * using the [[withDetailViewContext]] higher-order component.
 *
 * By default, a `<DetailView />` renders a simple wrapper that sets up a
 * 12-column grid. This can be overridden via the `component` prop, or the
 * [[UI_COMPONENTS]] option.
 */
export interface IDetailViewProps extends IStandardComponentProps {

    /** The name of the model class to render */
    model: string;

    /**
     * Use this prop to specify the primary key value of the record you want to
     * load. To create a new, empty record, leave this property unset.
     */
    primaryKeyValue?: string | null;

    /** A list of related models to load. Only `RelatedModel` fields are supported. */
    related?: string[];

    /**
     * If you provide a React component to this property, it will be used
     * instead of the component configured in [[UI_COMPONENTS]]. This component
     * will receive the same props as the `<DetailView />`
     */
    component?: React.ComponentType;
}

/**
 * @private
 */
export type IDetailViewLoadState = 'NONE' | 'LOADING' | 'SAVING' ;

/**
 * This interface represents the properties and methods available to components
 * nested in a `<DetailView />`.
 * @private
 */
export interface IDetailViewContext<T extends IModel = IModel> {

    /** The current loading state of the DetailView */
    loadState: IDetailViewLoadState;

    /** The ModelManager associated with this DetailView */
    manager: IModelManager;

    /** The current model data being displayed / edited in this DetailView */
    model: T | null;

    /** The current model's metadata */
    modelMeta: IModelMeta<T>;

    /** Metadata for any related models being managed by this DetailView */
    relatedModelMeta: { [fieldName: string]: IModelMeta<any> };

    /** The results of the most recent model validation */
    validation: IModelValidationResult | null;

    /** Whether the model's data has been changed since last save */
    dirty: boolean;

    /** Set the DetaiView's `loadState` and trigger a re-render */
    setLoadState(state: IDetailViewLoadState): void;

    /** Set or unset the `dirty` flag and trigger a re-render */
    setDirty(dirty: boolean): void;

    /** Trigger validation of the current model data */
    validate(): Promise<IModelValidationResult>;

    /**
     * Save the current model data. Uses the model's primaryKey to determine
     * whether to create or update the record
     */
    save(): Promise<IModelOperationResult<T, any>>;

    /** Remove the current model record */
    remove(): Promise<IModelOperationResult<T, any>>;

    /** Trigger a re-render of the DetailView */
    refresh(): void;
}

/**
 * @private
 */
export interface IDetailViewContextProp<T extends IModel = IModel> {
    detailViewContext: IDetailViewContext<T>;
}

/** @private */
export const RELATED_MODEL_VALIDATION_ERROR_MSG = 'Related model failed validation';
/** @private */
export const RELATED_MODEL_VALIDATION_ERROR_CODE = 'related_model_failed_validation';

/**
 * See [[IDetailViewProps]]
 * @private
 */
export class DetailView extends React.Component<IDetailViewProps> {

    context: IModelProviderContext;
    static contextTypes = {
        modelManager: PropTypes.object
    };

    detailViewContext: IDetailViewContext;

    constructor(props: IDetailViewProps, context: any) {
        super(props, context);

        if (!this.context.modelManager) {
            throw new Error('DetailView Error: must be nested inside a ModelProvider.');
        }
        const modelMeta = this.context.modelManager.getModelMeta(this.props.model);
        const relatedModelMeta: { [fieldName: string]: IModelMeta<any> } = {};

        if (this.props.related) {
            if (!(this.props.related instanceof Array)) {
                throw new Error('DetailView Error: related prop must be an array of field names');
            }
            for (const fieldName of this.props.related) {
                const field = modelMeta.fieldsByName[fieldName];
                if (!(field instanceof RelatedModelField)) {
                    throw new Error(`DetailView Error: invalid RelatedModel field name '${fieldName}' for model '${modelMeta.name}'`);
                }
                relatedModelMeta[fieldName] = this.context.modelManager.getModelMeta(field.options.model);
            }
        }

        this.detailViewContext = {
            loadState: 'NONE',
            manager: this.context.modelManager,
            model: null,
            modelMeta,
            relatedModelMeta,
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
            const model = this.context.modelManager.getNew(modelMeta.ctor);
            for (const fieldName in relatedModelMeta) {
                const relMeta = relatedModelMeta[fieldName];
                model[fieldName] = this.context.modelManager.getNew(relMeta.ctor);
            }
            this.setModel(model);
        }
    }

    async loadModel() {
        const meta = this.detailViewContext.modelMeta;
        if (!meta.primaryKey) {
            throw new Error(`DetailView Error: Cannot load data for model '${meta.name}' because it doesn't have a primaryKey field defined.`);
        }
        this.detailViewContext.loadState = 'LOADING';
        const readOpts: IReadOptions = {
            where: {
                [meta.primaryKey]: this.props.primaryKeyValue
            },
            limit: 1
        };
        if (this.props.related) {
            readOpts.related = this.props.related;
        }
        const result = await this.context.modelManager.read(
            meta.ctor, readOpts
        );
        if (this.detailViewContext.loadState == 'LOADING') {
            this.detailViewContext.loadState = 'NONE';
            if (result.results!.length == 1) {
                this.setModel(result.results![0]);
                this.forceUpdate();
            }
        }
    }

    setModel(model: IModel) {
        this.detailViewContext.model = model;
        this.detailViewContext.dirty = false;
        this.detailViewContext.validation = null;
    }

    setLoadState(state: IDetailViewLoadState) {
        if (state != this.detailViewContext.loadState) {
            this.detailViewContext.loadState = state;
            this.forceUpdate();
        }
    }

    setDirty(dirty: boolean) {
        if (dirty != this.detailViewContext.dirty) {
            this.detailViewContext.dirty = dirty;
            this.forceUpdate();
        }
    }

    async validate() {
        const ctx = this.detailViewContext;
        ctx.validation = await this.context.modelManager.validate(ctx.model!);
        this.forceUpdate();
        return ctx.validation;
    }

    async save() {
        const ctx = this.detailViewContext;
        if (!ctx.modelMeta.primaryKey) {
            throw new Error(`DetailView Error: Cannot save data for model '${ctx.modelMeta.name}' because it doesn't have a primaryKey field defined.`);
        }
        let result: IModelOperationResult<any, any>;
        let relatedResults: {
            [fieldName: string]: IModelOperationResult<any, any>;
        } = {};
        if (this.props.related) {
            for (const fieldName of this.props.related) {
                try {
                    if (ctx.manager.isNew(ctx.model![fieldName])) {
                        relatedResults[fieldName] = await ctx.manager.create(ctx.model![fieldName]);
                        ctx.model![fieldName] = relatedResults[fieldName].result;
                    }
                    else {
                        relatedResults[fieldName] = await ctx.manager.update(ctx.model![fieldName]);
                    }
                }
                catch (e) {
                    if (e instanceof ValidationError) {
                        ctx.validation = new ModelValidationResult();
                        (ctx.validation as ModelValidationResult).addFieldError(
                            fieldName,
                            RELATED_MODEL_VALIDATION_ERROR_MSG,
                            RELATED_MODEL_VALIDATION_ERROR_CODE,
                            { validation: e.validation }
                        );
                        this.forceUpdate();
                    }
                    throw e;
                }
            }
        }
        try {
            if (ctx.manager.isNew(ctx.model!)) {
                result = await ctx.manager.create(ctx.model!);
                // replace model data with created result
                ctx.model = result.result;
            }
            else {
                result = await ctx.manager.update(ctx.model!);
            }
        }
        catch (e) {
            if (e instanceof ValidationError) {
                ctx.validation = e.validation;
                this.forceUpdate();
            }
            throw e;
        }
        result.meta['relatedResults'] = relatedResults;
        ctx.validation = result.validation!;
        this.forceUpdate();
        return result;
    }

    async remove(): Promise<any> {
        const ctx = this.detailViewContext;
        if (!ctx.modelMeta.primaryKey) {
            throw new Error(`DetailView Error: Cannot remove record for model '${ctx.modelMeta.name}' because it doesn't have a primaryKey field defined.`);
        }
        let result: IModelOperationResult<any, any>;
        if (ctx.manager.isNew(ctx.model!)) {
            throw new Error('Cannot call remove() on a new model record.');
        }
        else {
            result = await ctx.manager.remove(ctx.model!);
        }
        this.setModel(ctx.manager.getNew(ctx.modelMeta.ctor));
        this.forceUpdate();
        return result;
    }

    static childContextTypes = {
        detailViewContext: PropTypes.object
    };

    getChildContext(): IDetailViewContextProp {
        return {
            detailViewContext: this.detailViewContext
        };
    }

    render() {
        const Component = this.props.component || UI_COMPONENTS.views.DetailView;
        return <Component {...this.props} />;
    }
}
