
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { ModelManager } from 'rev-models';

export interface IModelManagerProp {
    modelManager: ModelManager;
}

export interface IModelProviderContext {
    modelManager: ModelManager;
}

export class ModelProvider extends React.Component<IModelManagerProp> {

    static childContextTypes = {
        modelManager: PropTypes.object
    };

    getChildContext(): IModelProviderContext {
        return {
            modelManager: this.props.modelManager
        };
    }

    render() {
        return this.props.children;
    }

}
