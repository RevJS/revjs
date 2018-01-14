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

export interface IViewManagerContext {
    viewContext: {
        model: IModel;
        modelMeta: IModelMeta<any>;
        validation: ModelValidationResult;
        dirty: boolean;
        initModel(model?: IModel): void;
        isNew(): boolean;
        setDirty(dirty: boolean): void;
        validate(): Promise<ModelValidationResult>;
        save(): IModelOperationResult<any, any>;
    };
}

export class ViewManager extends React.Component<IViewManagerProps, IViewManagerState> {

    model: IModel;
    modelMeta: IModelMeta<any>;
    validation: ModelValidationResult;

    context: IModelProviderContext;
    static contextTypes = {
        modelManager: PropTypes.object
    };

    constructor(props: IViewManagerProps, context: any) {
        super(props, context);

        this.modelMeta = this.context.modelManager.getModelMeta(this.props.model);
        if (!this.modelMeta.primaryKey) {
            throw new Error('ViewManager Error: can only be used with models with a primaryKey defined');
        }
        this.state = {
            dirty: false
        };
    }

    initModel(model?: IModel) {
        if (model || !this.model) {
            if (model) {
                this.model = model;
            }
            else {
                this.model = new this.modelMeta.ctor();
                this.model[this.modelMeta.primaryKey] = this.props.primaryKeyValue;
            }
            this.validation = new ModelValidationResult();
            this.setState({
                dirty: false
            });
        }
    }

    isNew() {
        return typeof this.model[this.modelMeta.primaryKey] == 'undefined';
    }

    setDirty(dirty: boolean) {
        this.setState({ dirty });
    }

    async validate() {
        this.validation = await this.context.modelManager.validate(this.model);
        return this.validation;
    }

    static childContextTypes = {
        viewContext: PropTypes.object
    };

    getChildContext(): IViewManagerContext {
        return {
            viewContext: {
                model: this.model,
                modelMeta: this.modelMeta,
                validation: this.validation,
                dirty: this.state.dirty,
                initModel: (model) => this.initModel(model),
                isNew: () => this.isNew(),
                setDirty: (dirty) => this.setDirty(dirty),
                validate: () => this.validate(),
                save: () => null
            }
        };
    }

    render() {
        return this.props.children;
    }
}
