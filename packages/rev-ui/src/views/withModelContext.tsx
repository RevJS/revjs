
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { IModelContextProp } from './DetailView';

export function withModelContext<P>(component: React.ComponentType<P & IModelContextProp>): React.ComponentType<P> {

    return class extends React.Component<P> {

        context: IModelContextProp;
        static contextTypes = {
            modelContext: PropTypes.object
        };

        render() {
            const WrappedComponent = component;
            return <WrappedComponent modelContext={this.context.modelContext} {...this.props} />;
        }

    };

}