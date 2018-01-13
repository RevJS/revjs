
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { ModelManager, IModelMeta, IModelOperationResult } from 'rev-models';
import { IReadMeta } from 'rev-models/lib/models/types';

import { withStyles, WithStyles, StyleRules, StyledComponentProps } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import Table, { TableHead, TableBody, TableRow, TableCell } from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

export interface IModelListProps {
    model: string;
    fields: string[];
    title?: string;
    rowLimit?: number;
}

export interface IModelListState {
    loadState: 'loading' | 'loaded' | 'load_error';
    modelData?: IModelOperationResult<any, IReadMeta>;
    limit: number;
    offset: number;
}

export interface IModelListReceivedContext {
    modelManager: ModelManager;
}

const styles: StyleRules = {
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    progressWrapper: {
        margin: 20
    },
    progressBar: {
        marginTop: 20
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

class ModelListC extends React.Component<IModelListProps & WithStyles, IModelListState> {

    context: IModelListReceivedContext;
    static contextTypes = {
        modelManager: PropTypes.object
    };

    modelMeta: IModelMeta<any>;

    constructor(props: IModelListProps & WithStyles, context: IModelProviderContext) {
        super(props, context);
        this.context.modelManager = context.modelManager;
        if (!this.context.modelManager) {
            throw new Error('ModelList Error: must be nested inside a ModelProvider.');
        }
        if (!props.model || !this.context.modelManager.isRegistered(props.model)) {
            throw new Error(`ModelList Error: Model '${props.model}' is not registered.`);
        }
        this.modelMeta = this.context.modelManager.getModelMeta(props.model);
        for (const fieldName of props.fields) {
            if (!(fieldName in this.modelMeta.fieldsByName)) {
                throw new Error(`ModelList Error: Model '${props.model}' does not have a field called '${fieldName}'.`);
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
            const firstRecordNumber = readMeta.total_count ? readMeta.offset + 1 : 0;
            const lastRecordNumber = Math.min(
                readMeta.offset + readMeta.limit,
                readMeta.total_count
            );
            readMeta.total_count;
            paginationText = `Records ${firstRecordNumber}-${lastRecordNumber} of ${readMeta.total_count}`;
            if (lastRecordNumber < readMeta.total_count) {
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

        const tableBody = (
            <TableBody>
                {this.state.modelData && this.state.modelData.results.map((record, rowIdx) => {
                    return (
                        <TableRow key={rowIdx} hover>
                            {this.props.fields.map((fieldName, colIdx) => {
                                const data = record[fieldName].toString();
                                return (
                                    <TableCell key={colIdx} padding="dense">{data}</TableCell>
                                );
                            })}
                        </TableRow>
                    );
                })}
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

export const ModelList: React.ComponentType<IModelListProps & StyledComponentProps>
    = withStyles(styles)(ModelListC);

export const lifecycleOptions = {
    enableComponentDidMount: true
};
