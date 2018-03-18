
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { IModelProviderContext } from './ModelProvider';
import { IModelManager } from 'rev-models';

/**
 * @private
 */
export interface IModelManagerProp {
    modelManager: IModelManager;
}

/**
 * Use this higher-order component function to provide the passed component
 * with access to the current ModelManager via a `modelManager` prop.
 * @param component The component to wrap
 */
export function withModelManager<P>(component: React.ComponentType<P & IModelManagerProp>): React.ComponentType<P> {

    return class extends React.Component<P> {

        context: IModelProviderContext;
        static contextTypes = {
            modelManager: PropTypes.object
        };

        render() {
            const WrappedComponent = component;
            return <WrappedComponent modelManager={this.context.modelManager} {...this.props} />;
        }

    };

}