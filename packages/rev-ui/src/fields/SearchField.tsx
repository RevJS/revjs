
import * as React from 'react';
import { fields } from 'rev-models';

import { IModelProviderContext } from '../provider/ModelProvider';
import { ISearchViewContextProp } from '../views/SearchView';
import { withSearchViewContext } from '../views/withSearchViewContext';
import { UI_COMPONENTS } from '../config';
import { IStandardComponentProps, getStandardProps } from '../utils/props';

/**
 * @private
 */
export type ColspanOptions = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * The `<SearchField />` component should be included in a `<SearchView />`.
 * When passed the name of a model field, it will render an appropriate input
 * field to allow the value of the field to be searched.
 */
export interface ISearchFieldProps extends IStandardComponentProps {

    /**
     * Model field name. Must correspond with a field on the model specified
     * for the `<SearchView />` component
     */
    name: string;

    /** How many columns to span for narrow screens (1-12). Default = 12 */
    colspanNarrow?: ColspanOptions;

    /** How many columns to span for normal screens (1-12). Default = 6 */
    colspan?: ColspanOptions;

    /** How many columns to span for wide screens (1-12). Default = 6 */
    colspanWide?: ColspanOptions;

    /**
     * If you provide a React component to this property, it will be used
     * instead of the component configured in [[UI_COMPONENTS]] for the
     * corresponding Field type. This component will be passed
     * [[ISearchFieldComponentProps]]
     */
    component?: React.ComponentType<ISearchFieldComponentProps>;
}

/**
 * @private
 */
export interface ISearchFieldState {
    criteria: object;
}

/**
 * @private
 */
export interface ISearchFieldComponentProps extends IStandardComponentProps  {
    field: fields.Field;
    label: string;
    colspanNarrow: ColspanOptions;
    colspan: ColspanOptions;
    colspanWide: ColspanOptions;
    criteria: object;
    onCriteriaChange: (value: any) => void;
}

class SearchFieldC extends React.Component<ISearchFieldProps & ISearchViewContextProp, ISearchFieldState> {

    modelField: fields.Field;
    fieldComponentName: string;

    constructor(props: ISearchFieldProps & ISearchViewContextProp, context: IModelProviderContext & ISearchViewContextProp) {
        super(props, context);
        if (!this.props.searchViewContext) {
            throw new Error('SearchField Error: must be nested inside a SearchView.');
        }
        const meta = this.props.searchViewContext.modelMeta;
        if (!(props.name in meta.fieldsByName)) {
            throw new Error(`SearchField Error: Model '${meta.name}' does not have a field called '${props.name}'.`);
        }
        this.modelField = meta.fieldsByName[props.name];
        this.fieldComponentName = this.modelField.constructor.name;
        if (!this.props.component && !UI_COMPONENTS.searchFields[this.fieldComponentName]) {
            throw new Error(`SearchField Error: There is no UI_COMPONENT registered for field type '${this.fieldComponentName}'`);
        }
    }

    onCriteriaChange(criteria: any) {
        this.props.searchViewContext.where[this.modelField.name] = criteria;
        this.setState({ criteria });
    }

    render() {

        const ctx = this.props.searchViewContext;

        let cProps: ISearchFieldComponentProps = {
            field: this.modelField,
            label: this.modelField.options.label || this.modelField.name,
            colspanNarrow: this.props.colspanNarrow || 12,
            colspan: this.props.colspan || 6,
            colspanWide: this.props.colspanWide || this.props.colspan || 6,
            criteria: ctx.where[this.modelField.name],
            onCriteriaChange: (criteria) => this.onCriteriaChange(criteria)
        };
        const sProps = getStandardProps(this.props);

        const Component = this.props.component || UI_COMPONENTS.searchFields[this.fieldComponentName];
        return <Component {...cProps} {...sProps} />;

    }

}

/**
 * See [[IFieldProps]]
 * @private
 */
export const SearchField = withSearchViewContext(SearchFieldC);
