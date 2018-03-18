
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelManager } from 'rev-models';

/**
 * @private
 */
export interface IModelProviderProps {
    modelManager: IModelManager;
}

/**
 * @private
 */
export interface IModelProviderContext {
    modelManager: IModelManager;
}

/**
 * The `<ModelProvider />` component provides access to a shared RevJS
 * **ModelManager** for child components. Components such as
 * `<DetailView />` and `<ListView />` must be nested inside a
 * `<ModelManager />` component.
 *
 * You can give your own components access to the specified modelManager
 * using the [[withModelManager]] higher order component, which will
 * provide the component with a `modelManager` prop.
 */
export class ModelProvider extends React.Component<IModelProviderProps> {

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
