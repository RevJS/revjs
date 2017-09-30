
import * as React from 'react';

import { ModelManager } from 'rev-models';

export interface IModelProviderProps {
    modelManager: ModelManager;
}

export interface IModelProviderContext {
    modelManager: ModelManager;
}

export class ModelProvider extends React.Component<IModelProviderProps, void> {

    static childContextTypes = {
        modelManager: React.PropTypes.object
    };

    getChildContext(): IModelProviderContext {
        return {
            modelManager: this.props.modelManager
        };
    }

    render() {
        return React.Children.only(this.props.children);
    }

}
