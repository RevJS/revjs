
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelMeta, IModelOperationResult, IModel, fields } from 'rev-models';
import { IReadMeta } from 'rev-models/lib/models/types';
import { UI_COMPONENTS } from '../config';

/**
 * A `<ListView />` renders a list of model records. By default it renders a
 * Table view with pagination, however you can pass your own component in order
 * to render the list of records in another way.
 *
 * A `<ListView />` component accepts a single sub-component, which is passed
 * [[IListViewComponentProps]] to be rendered as required.
 */
export interface IListViewProps {

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
    onRecordPress?: (model: IModel) => void;

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
export interface IListViewComponentProps<T extends IModel = any> {

    /** The title for the rendered list */
    title: string;

    /** The ListView loading state */
    loadState: IListViewLoadState;

    /** The list of fields (columns) to be rendered */
    fields?: fields.Field[];

    /** The retrieved model data */
    records: T[];

    /** The record number of the first record in `records` */
    firstRecordNumber: number;

    /** The record number of the last record in `records` */
    lastRecordNumber: number;

    /** The total number of records matching the specified query */
    totalCount: number;

    /** Whether the Back button should be disabled (e.g. firstRecordNumber = 1) */
    backButtonDisabled: boolean;

    /** Whether the Forward button should be disabled (e.g. we're on the last page of data) */
    forwardButtonDisabled: boolean;

    /** Back button press event handler */
    onBackButtonPress(): void;

    /** Forward button press event handler */
    onForwardButtonPress(): void;

    /** Record press event handler */
    onRecordPress(model: IModel): void;
}

/**
 * @private
 */
export interface IListViewState {
    loadState: IListViewLoadState;
    modelData?: IModelOperationResult<any, IReadMeta>;
    where: object;
    related: string[];
    orderBy: string[];
    limit: number;
    offset: number;
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

    modelMeta: IModelMeta<any>;

    constructor(props: IListViewProps, context: any) {
        super(props, context);
        this.context.modelManager = context.modelManager;
        if (!this.context.modelManager) {
            throw new Error('ListView Error: must be nested inside a ModelProvider.');
        }
        if (!props.model || !this.context.modelManager.isRegistered(props.model)) {
            throw new Error(`ListView Error: Model '${props.model}' is not registered.`);
        }
        this.modelMeta = this.context.modelManager.getModelMeta(this.props.model);
        if (props.fields) {
            for (const fieldName of props.fields) {
                const field = this.modelMeta.fieldsByName[fieldName];
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
            loadState: 'LOADING',
            where: props.where || {},
            related: props.related || null,
            orderBy: props.orderBy || null,
            limit: props.limit || 20,
            offset: 0,
        };
    }

    onForwardButtonPress() {
        this.loadData(this.state.limit, this.state.offset + this.state.limit);
    }

    onBackButtonPress() {
        const offset = Math.max(this.state.offset - this.state.limit, 0);
        this.loadData(this.state.limit, offset);
    }

    onRecordPress(record: IModel) {
        if (this.props.onRecordPress) {
            this.props.onRecordPress(record);
        }
    }

    async loadData(limit: number, offset: number) {
        this.setState({
            loadState: 'LOADING'
        });
        const modelData = await this.context.modelManager.read(
            this.modelMeta.ctor,
            {
                where: this.state.where,
                related: this.state.related,
                orderBy: this.state.orderBy,
                limit,
                offset,
            });
        if (modelData.success && modelData.results) {
            this.setState({
                loadState: 'NONE',
                modelData,
                limit,
                offset
            });
        }
    }

    render() {

        const listFields = this.props.fields && this.props.fields.map((fieldName) => this.modelMeta.fieldsByName[fieldName]);

        const cProps: IListViewComponentProps & {children?: any} = {
            loadState: this.state.loadState,
            title: this.props.title ? this.props.title : this.modelMeta.label + ' List',
            fields: listFields,
            records: [],
            firstRecordNumber: 0,
            lastRecordNumber: 0,
            totalCount: 0,
            backButtonDisabled: true,
            forwardButtonDisabled: true,

            onBackButtonPress: () => this.onBackButtonPress(),
            onForwardButtonPress: () => this.onForwardButtonPress(),
            onRecordPress: (record: IModel) => this.onRecordPress(record)
        };

        if (this.state.modelData) {
            const readMeta = this.state.modelData.meta;
            cProps.firstRecordNumber = readMeta.totalCount ? readMeta.offset + 1 : 0;
            cProps.lastRecordNumber = Math.min(
                readMeta.offset + readMeta.limit,
                readMeta.totalCount
            );
            if (cProps.lastRecordNumber < readMeta.totalCount) {
                cProps.forwardButtonDisabled = false;
            }
            if (cProps.firstRecordNumber > 1) {
                cProps.backButtonDisabled = false;
            }
            cProps.totalCount = readMeta.totalCount;
            cProps.records = this.state.modelData.results;
        }

        const Component = this.props.component || UI_COMPONENTS.views.ListView;
        return <Component {...cProps} />;
    }

    async componentDidMount() {
        if (lifecycleOptions.enableComponentDidMount) {
            this.loadData(this.state.limit, this.state.offset);
        }
    }

}

/**
 * @private
 */
export const lifecycleOptions = {
    enableComponentDidMount: true
};
