import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModel, IModelMeta, IModelManager } from 'rev-models';
import { UI_COMPONENTS } from '../config';
import { IStandardComponentProps } from '../utils/props';

/**
 * A `<SearchView />` serves as a wrapper for a set of `<SearchField />`s
 * and can be used to render a search screen based on your model metadata.
 *
 * A `<SearchView />` component provides its sub-components with access to
 * [[ISearchViewContext]] to allow them to read and update the current model
 * search criteria. You can connect your own components to ISearchViewContext
 * using the [[withSearchViewContext]] higher-order component.
 *
 * By default, a `<SearchView />` renders a simple wrapper that sets up a
 * 12-column grid. This can be overridden via the `component` prop, or the
 * [[UI_COMPONENTS]] option.
 */
export interface ISearchViewProps extends IStandardComponentProps {

    /** The name of the model class to render */
    model: string;

    /**
     * This method will be called with the current search criteria when the user
     * triggers the search action.
     */
    onSearch(where: object): void;

    /**
     * If you provide a React component to this property, it will be used
     * instead of the component configured in [[UI_COMPONENTS]]. This component
     * will receive the same props as the `<SearchView />`
     */
    component?: React.ComponentType;
}

/**
 * This interface represents the properties and methods available to components
 * nested in a `<SearchView />`.
 * @private
 */
export interface ISearchViewContext<T extends IModel = IModel> {

    /** The ModelManager associated with this SearchView */
    manager: IModelManager;

    /** The current where clause being edited in this SearchView */
    where: object;

    /** The current model's metadata */
    modelMeta: IModelMeta<T>;

    /**
     * Triggers the search action (calls the passed-in onSearch() function)
     */
    search(): void;
}

/**
 * @private
 */
export interface ISearchViewContextProp<T extends IModel = IModel> {
    searchViewContext: ISearchViewContext<T>;
}

/**
 * See [[ISearchViewProps]]
 * @private
 */
export class SearchView extends React.Component<ISearchViewProps> {

    context: IModelProviderContext;
    static contextTypes = {
        modelManager: PropTypes.object
    };

    searchViewContext: ISearchViewContext;

    constructor(props: ISearchViewProps, context: any) {
        super(props, context);

        if (!this.context.modelManager) {
            throw new Error('SearchView Error: must be nested inside a ModelProvider.');
        }
        const modelMeta = this.context.modelManager.getModelMeta(this.props.model);

        this.searchViewContext = {
            manager: this.context.modelManager,
            where: {},
            modelMeta,
            search: () => this.search(),
        };
    }

    search() {
        this.props.onSearch(this.searchViewContext.where);
    }

    static childContextTypes = {
        searchViewContext: PropTypes.object
    };

    getChildContext(): ISearchViewContextProp {
        return {
            searchViewContext: this.searchViewContext
        };
    }

    render() {
        const Component = this.props.component || UI_COMPONENTS.views.SearchView;
        return <Component {...this.props} />;
    }
}
