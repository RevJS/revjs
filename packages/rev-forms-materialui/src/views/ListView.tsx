
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IModelMeta, IModelOperationResult } from 'rev-models';
import { IReadMeta } from 'rev-models/lib/models/types';

import { withStyles, WithStyles, StyleRules, StyledComponentProps } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import Table, { TableHead, TableBody, TableRow, TableCell } from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { IViewManagerContext } from './ViewManager';

export interface IListViewProps {
    model: string;
    fields: string[];
    title?: string;
    rowLimit?: number;
}

export interface IListViewState {
    loadState: 'loading' | 'loaded' | 'load_error';
    modelData?: IModelOperationResult<any, IReadMeta>;
    limit: number;
    offset: number;
}

const styles: StyleRules = {
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    toolbar: {
        justifyContent: 'space-between',
        borderBottom: '1px solid #EBEBEB'
    },
    pagination: {
        display: 'flex',
        alignItems: 'center'
    },
    table: {
        cursor: 'default'
    }
};

class ListViewC extends React.Component<IListViewProps & WithStyles, IListViewState> {

    context: IModelProviderContext & IViewManagerContext;
    static contextTypes = {
        modelManager: PropTypes.object,
        viewContext: PropTypes.object
    };

    modelMeta: IModelMeta<any>;

    constructor(props: IListViewProps & WithStyles, context: IModelProviderContext) {
        super(props, context);
        this.context.modelManager = context.modelManager;
        if (!this.context.modelManager) {
            throw new Error('ListView Error: must be nested inside a ModelProvider.');
        }
        if (!this.context.viewContext) {
            throw new Error('ListView Error: must be nested inside a ViewManager.');
        }
        if (!props.model || !this.context.modelManager.isRegistered(props.model)) {
            throw new Error(`ListView Error: Model '${props.model}' is not registered.`);
        }
        this.modelMeta = this.context.viewContext.modelMeta;
        for (const fieldName of props.fields) {
            if (!(fieldName in this.modelMeta.fieldsByName)) {
                throw new Error(`ListView Error: Model '${props.model}' does not have a field called '${fieldName}'.`);
            }
        }

        this.state = {
            loadState: 'loading',
            limit: props.rowLimit || 20,
            offset: 0
        };
    }

    onForwardButtonPressed() {
        this.loadData(this.state.limit, this.state.offset + this.state.limit);
    }

    onBackButtonPressed() {
        const offset = Math.max(this.state.offset - this.state.limit, 0);
        this.loadData(this.state.limit, offset);
    }

    async loadData(limit: number, offset: number) {
        this.setState({
            loadState: 'loading'
        });
        const modelData = await this.context.modelManager.read(
            this.modelMeta.ctor, {}, { limit, offset });
        if (modelData.success && modelData.results) {
            this.setState({
                loadState: 'loaded',
                modelData,
                limit,
                offset
            });
        }
    }

    render() {

        const title = this.props.title ? this.props.title : this.modelMeta.label + ' List';

        let paginationText = 'Loading...';
        let backButtonDisabled = true;
        let forwardButtonDisabled = true;

        if (this.state.loadState == 'loaded') {
            const readMeta = this.state.modelData.meta;
            const firstRecordNumber = readMeta.totalCount ? readMeta.offset + 1 : 0;
            const lastRecordNumber = Math.min(
                readMeta.offset + readMeta.limit,
                readMeta.totalCount
            );
            readMeta.totalCount;
            paginationText = `Records ${firstRecordNumber}-${lastRecordNumber} of ${readMeta.totalCount}`;
            if (lastRecordNumber < readMeta.totalCount) {
                forwardButtonDisabled = false;
            }
            if (firstRecordNumber > 1) {
                backButtonDisabled = false;
            }
        }

        const toolbar = (
            <Toolbar className={this.props.classes.toolbar}>
                <Typography type="title">{title}</Typography>
                <div className={this.props.classes.pagination}>
                    <Typography type="caption">
                        {paginationText}
                    </Typography>
                    <IconButton
                        onClick={() => this.onBackButtonPressed()}
                        disabled={backButtonDisabled}
                    >
                        <KeyboardArrowLeft titleAccess="Previous Page" />
                    </IconButton>
                    <IconButton
                        onClick={() => this.onForwardButtonPressed()}
                        disabled={forwardButtonDisabled}
                    >
                        <KeyboardArrowRight titleAccess="Next Page" />
                    </IconButton>
                </div>
            </Toolbar>
        );

        const tableHead = (
            <TableHead>
                <TableRow>
                    {this.props.fields.map((fieldName, idx) => {
                        const field = this.modelMeta.fieldsByName[fieldName];
                        return (
                            <TableCell key={idx} padding="dense">{field.options.label || field.name}</TableCell>
                        );
                    })}
                </TableRow>
            </TableHead>);

        const tableBody = this.state.modelData && (
            <TableBody>
                {this.state.modelData.results.map((record, rowIdx) => (
                    <TableRow key={rowIdx} hover>
                        {this.props.fields.map((fieldName, colIdx) => {
                            const data = record[fieldName].toString();
                            return (
                                <TableCell key={colIdx} padding="dense">{data}</TableCell>
                            );
                    })}
                    </TableRow>
                ))}
            </TableBody>
        );

        return (
            <Paper className={this.props.classes.root}>
                {toolbar}
                <Table className={this.props.classes.table}>
                    {tableHead}
                    {tableBody}
                </Table>
            </Paper>
        );
    }

    async componentDidMount() {
        if (lifecycleOptions.enableComponentDidMount) {
            this.loadData(this.state.limit, this.state.offset);
        }
    }

}

export const ListView: React.ComponentType<IListViewProps & StyledComponentProps>
    = withStyles(styles)(ListViewC);

export const lifecycleOptions = {
    enableComponentDidMount: true
};
