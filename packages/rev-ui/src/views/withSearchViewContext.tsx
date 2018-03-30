
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { ISearchViewContextProp } from './SearchView';

/**
 * Use this higher-order component function to provide the passed component
 * with access to [[ISearchViewContext]] via a `searchViewContext` prop.
 * @param component The component to wrap
 */
export function withSearchViewContext<P>(component: React.ComponentType<P & ISearchViewContextProp>): React.ComponentType<P> {

    return class extends React.Component<P> {

        context: ISearchViewContextProp;
        static contextTypes = {
            searchViewContext: PropTypes.object
        };

        render() {
            const WrappedComponent = component;
            return <WrappedComponent searchViewContext={this.context.searchViewContext} {...this.props} />;
        }

    };

}