
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelMeta, IModelOperationResult, IModel, fields } from 'rev-models';
import { IReadMeta, IReadOptions } from 'rev-models/lib/models/types';
import { UI_COMPONENTS } from '../config';
import { IStandardComponentProps, getStandardProps } from '../utils/props';

/**
 * A `<ListView />` renders a list of model records. By default it renders a
 * Table view with pagination, however you can pass your own component in order
 * to render the list of records in another way.
 *
 * A `<ListView />` component accepts a single sub-component, which is passed
 * [[IListViewComponentProps]] to be rendered as required.
 */
export interface IListViewProps extends IStandardComponentProps {

    /** The name of the model class to search & render */
    model: string;

    /** A list of fields to be rendered */
    fields?: string[];

    /** A list of any related model fields to be read */
    related?: string[];

    /** An optional title for the rendered list */
    title?: string;

    /** A standard RevJS 'where' clause to use to filter the data */
    where?: object;

    /** A standard RevJS 'orderBy' clause to sort the data  */
    orderBy?: string[];

    /** The meximum number of records to retrieve and render at a time */
    limit?: number;

    /** This method will be called when a user clicks on a record in the list */
    onItemPress?: (model: IModel) => void;

    /**
     * If you provide a React component to this property, it will be used
     * instead of the component configured in [[UI_COMPONENTS]]. It will
     * be passed [[IListViewComponentProps]]
     */
    component?: React.ComponentType<IListViewComponentProps>;
}

/**
 * @private
 */
export type IListViewLoadState = 'NONE' | 'LOADING';

/**
 * These props are passed down to the `<ListView />` sub-component, selected
 * via its `component` property, or via the [[UI_COMPONENTS]] option.
 * @private
 */
export interface IListViewComponentProps<T extends IModel = any> extends IStandardComponentProps {

    /** The title for the rendered list */
    title: string;

    /** The ListView loading state */
    loadState: IListViewLoadState;

    /** The list of fields (columns) to be rendered */
    fields?: fields.Field[];

    /** The retrieved model data */
    results: T[];

    /** The item number of the first item in `results` */
    firstItemNumber: number;

    /** The item number of the last item in `results` */
    lastItemNumber: number;

    /** The total number of items matching the specified query */
    totalCount: number;

    /** Whether the Back button should be disabled (e.g. firstItemNumber = 1) */
    backButtonDisabled: boolean;

    /** Whether the Forward button should be disabled (e.g. we're on the last page of data) */
    forwardButtonDisabled: boolean;

    /** Back button press event handler */
    onBackButtonPress(): void;

    /** Forward button press event handler */
    onForwardButtonPress(): void;

    /** Item press event handler */
    onItemPress(model: IModel): void;
}

/**
 * @private
 */
export interface IListViewState extends IReadOptions {
    loadState: IListViewLoadState;
    modelMeta?: IModelMeta<any>;
    modelData?: IModelOperationResult<any, IReadMeta>;
}

/**
 * See [[IListViewProps]]
 * @private
 */
export class ListView extends React.Component<IListViewProps, IListViewState> {

    context: IModelProviderContext;
    static contextTypes = {
        modelManager: PropTypes.object,
    };

    constructor(props: IListViewProps, context: any) {
        super(props, context);
        this.context.modelManager = context.modelManager;
        if (!this.context.modelManager) {
            throw new Error('ListView Error: must be nested inside a ModelProvider.');
        }
        if (!props.model || !this.context.modelManager.isRegistered(props.model)) {
            throw new Error(`ListView Error: Model '${props.model}' is not registered.`);
        }
        const meta = this.context.modelManager.getModelMeta(this.props.model);
        if (props.fields) {
            for (const fieldName of props.fields) {
                const field = meta.fieldsByName[fieldName];
                if (!field) {
                    throw new Error(`ListView Error: Model '${props.model}' does not have a field called '${fieldName}'.`);
                }
                else if (field instanceof fields.RelatedModelFieldBase) {
                    if (field instanceof fields.RelatedModelField) {
                        if (!props.related || props.related.indexOf(field.name) == -1) {
                            throw new Error(`To render the related model field '${fieldName}', it must be included in the "related" prop of the ListView.`);
                        }
                    }
                    else {
                        throw new Error(`Related model field '${fieldName}' is invalid. Only RelatedModel fields are supported in ListViews currently.`);
                    }
                }
            }
        }

        this.state = {
            modelMeta: meta,
            loadState: 'LOADING',
            where: props.where || {},
            related: props.related || null,
            orderBy: props.orderBy || null,
            limit: props.limit || 20,
            offset: 0
        };
    }

    async componentDidMount() {
        if (lifecycleOptions.enableComponentDidMount) {
            this.loadData();
        }
    }

    onForwardButtonPress() {
        this.setState({ offset: this.state.offset + this.state.limit });
        this.loadData();
    }

    onBackButtonPress() {
        this.setState({ offset: Math.max(this.state.offset - this.state.limit, 0) });
        this.loadData();
    }

    onItemPress(model: IModel) {
        if (this.props.onItemPress) {
            this.props.onItemPress(model);
        }
    }

    async loadData() {
        this.setState({
            loadState: 'LOADING'
        });
        const modelData = await this.context.modelManager.read(
            this.state.modelMeta.ctor,
            {
                where: this.state.where,
                related: this.state.related,
                orderBy: this.state.orderBy,
                limit: this.state.limit,
                offset: this.state.offset,
            });
        if (modelData.success && modelData.results) {
            this.setState({
                loadState: 'NONE',
                modelData
            });
        }
    }

    componentWillReceiveProps(newProps: IListViewProps) {
        if (newProps.where != this.state.where) {
            this.setState({
                where: newProps.where
            });
            this.loadData();
        }
    }

    render() {

        const listFields = this.props.fields && this.props.fields.map((fieldName) => this.state.modelMeta.fieldsByName[fieldName]);

        const cProps: IListViewComponentProps & {children?: any} = {
            loadState: this.state.loadState,
            title: this.props.title ? this.props.title : this.state.modelMeta.label + ' List',
            fields: listFields,
            results: [],
            firstItemNumber: 0,
            lastItemNumber: 0,
            totalCount: 0,
            backButtonDisabled: true,
            forwardButtonDisabled: true,

            onBackButtonPress: () => this.onBackButtonPress(),
            onForwardButtonPress: () => this.onForwardButtonPress(),
            onItemPress: (model: IModel) => this.onItemPress(model)
        };

        if (this.state.modelData) {
            const readMeta = this.state.modelData.meta;
            cProps.firstItemNumber = readMeta.totalCount ? readMeta.offset + 1 : 0;
            cProps.lastItemNumber = Math.min(
                readMeta.offset + readMeta.limit,
                readMeta.totalCount
            );
            if (cProps.lastItemNumber < readMeta.totalCount) {
                cProps.forwardButtonDisabled = false;
            }
            if (cProps.firstItemNumber > 1) {
                cProps.backButtonDisabled = false;
            }
            cProps.totalCount = readMeta.totalCount;
            cProps.results = this.state.modelData.results;
        }

        const sProps = getStandardProps(this.props);

        const Component = this.props.component || UI_COMPONENTS.views.ListView;
        return <Component {...cProps} {...sProps} />;
    }

}

/**
 * @private
 */
export const lifecycleOptions = {
    enableComponentDidMount: true
};
