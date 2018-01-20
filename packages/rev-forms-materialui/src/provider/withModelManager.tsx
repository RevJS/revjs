
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { IModelManagerProp } from './ModelProvider';

export function withModelManager<P>(component: React.ComponentType<P & IModelManagerProp>): React.ComponentType<P> {

    return class extends React.Component<P> {

        context: IModelManagerProp;
        static contextTypes = {
            modelManager: PropTypes.object
        };

        render() {
            const WrappedComponent = component;
            return <WrappedComponent modelManager={this.context.modelManager} {...this.props} />;
        }

    };

}