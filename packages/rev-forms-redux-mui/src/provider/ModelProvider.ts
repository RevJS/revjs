
import * as React from 'react';

import { ModelRegistry } from 'rev-models';

export interface IModelProviderProps {
    registry: ModelRegistry;
}

export interface IModelProviderContext {
    modelRegistry: ModelRegistry;
}

export class ModelProvider extends React.Component<IModelProviderProps, void> {

    static childContextTypes = {
        modelRegistry: React.PropTypes.object
    };

    getChildContext(): IModelProviderContext {
        return {
            modelRegistry: this.props.registry
        };
    }

    render() {
        return React.Children.only(this.props.children);
    }

}
