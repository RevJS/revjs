
import * as React from 'react';

import { ISearchViewContextProp } from '../views/SearchView';
import { withSearchViewContext } from '../views/withSearchViewContext';
import { UI_COMPONENTS } from '../config';
import { IActionComponentProps } from './types';
import { IStandardComponentProps, getStandardProps } from '../utils/props';

/**
 * A `<SearchAction />` component should be included inside a
 * `<SearchView />`. By default it renders a button that, when clicked,
 * triggers the onSearch event handler of the SearchView
 */
export interface ISearchActionProps extends IStandardComponentProps {

    /** Action label (default = "Search") */
    label?: string;

    /** Set to true to make this the default action for the DetailView */
    defaultAction?: boolean;

    /**
     * If you provide a React component to this property, it will be used
     * instead of the component configured in [[UI_COMPONENTS]]. It will
     * be passed [[IActionComponentProps]]
     */
    component?: React.ComponentType<any>;
}

class SearchActionC extends React.Component<ISearchActionProps & ISearchViewContextProp> {

    constructor(props: ISearchActionProps & ISearchViewContextProp) {
        super(props);
        if (!this.props.searchViewContext) {
            throw new Error('SearchAction Error: must be nested inside a SearchView');
        }
    }

    async doAction() {
        this.props.searchViewContext.search();
    }

    render() {

        const cProps: IActionComponentProps = {
            label: this.props.label || 'Search',
            disabled: false,
            defaultAction: this.props.defaultAction ? true : false,
            doAction: () => this.doAction(),
            children: this.props.children
        };
        const sProps = getStandardProps(this.props);

        const Component = this.props.component || UI_COMPONENTS.actions.SearchAction;
        return <Component {...cProps} {...sProps} />;
    }
}

/**
 * See [[ISearchActionProps]]
 * @private
 */
export const SearchAction = withSearchViewContext(SearchActionC);
