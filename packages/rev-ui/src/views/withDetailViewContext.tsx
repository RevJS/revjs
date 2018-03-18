
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { IDetailViewContextProp } from './DetailView';

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