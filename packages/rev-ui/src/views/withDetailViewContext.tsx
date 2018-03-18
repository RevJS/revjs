
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { IDetailViewContextProp } from './DetailView';

/**
 * Use this higher-order component function to provide the passed component
 * with access to [[IDetailViewContext]] via a `detailViewContext` prop.
 * @param component The component to wrap
 */
export function withDetailViewContext<P>(component: React.ComponentType<P & IDetailViewContextProp>): React.ComponentType<P> {

    return class extends React.Component<P> {

        context: IDetailViewContextProp;
        static contextTypes = {
            detailViewContext: PropTypes.object
        };

        render() {
            const WrappedComponent = component;
            return <WrappedComponent detailViewContext={this.context.detailViewContext} {...this.props} />;
        }

    };

}