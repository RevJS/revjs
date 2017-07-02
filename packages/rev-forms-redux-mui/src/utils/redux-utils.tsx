
// Thanks for blainekasten for this!...
// https://gist.github.com/blainekasten/cbfe441916a1eaacd754b688b557df0f

import * as React from 'react';
import { connect as reduxConnect } from 'react-redux';

function wrapWithContext(mapStateToProps: any, mapDispatchToProps: any, contextTypes: any, component: any) {
    return class ConnectedComponent extends React.Component {
        mapStateToProps: any;
        mapDispatchToProps: any;
        component: any;

        constructor(props: any, context: any) {
            super(props, context);

            this.mapStateToProps = mapStateToProps
                ? (state: any, ownProps: any) => mapStateToProps(state, ownProps, context)
                : null;
            this.mapDispatchToProps = mapDispatchToProps
                ? (dispatch: any, ownProps: any) => mapDispatchToProps(dispatch, ownProps, context)
                : null;
            this.component = reduxConnect(this.mapStateToProps, this.mapDispatchToProps)(component);
        }

        static contextTypes = contextTypes;

        render() {
            const Component = this.component;
            return <Component {...this.props} />;
        }
    };
}

export function connectWithContext(mapStateToProps: any, mapDispatchToProps: any, contextTypes: any): any {
    return (component: any) => {
        return wrapWithContext(
            mapStateToProps,
            mapDispatchToProps,
            contextTypes,
            component
        );
    };
}
