import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelMeta } from 'rev-models';

export interface IViewManagerProps {
    model: string;
    primaryKeyValue?: string;
}

export interface IViewManagerState {
    dirty: boolean;
}

export interface IViewManagerContext {
    viewContext: {
        modelMeta: IModelMeta<any>;
        primaryKeyValue: string;
        dirty: boolean;
        setDirty(dirty: boolean): void;
    };
}

export class ViewManager extends React.Component<IViewManagerProps, IViewManagerState> {

    modelMeta: IModelMeta<any>;
    primaryKeyValue: string;

    context: IModelProviderContext;
    static contextTypes = {
        modelManager: PropTypes.object
    };

    constructor(props: IViewManagerProps, context: IModelProviderContext) {
        super(props, context);

        this.modelMeta = this.context.modelManager.getModelMeta(this.props.model);
        this.state = {
            dirty: false
        };
    }

    setDirty(dirty: boolean) {
        this.setState({ dirty });
    }

    static childContextTypes = {
        viewContext: PropTypes.object
    };

    getChildContext(): IViewManagerContext {
        return {
            viewContext: {
                modelMeta: this.modelMeta,
                primaryKeyValue: this.primaryKeyValue,
                dirty: this.state.dirty,
                setDirty: this.setDirty
            }
        };
    }

    render() {
        return this.props.children;
    }
}
