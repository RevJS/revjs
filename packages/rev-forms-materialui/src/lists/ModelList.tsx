
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { ModelManager, IModelMeta, IModelOperationResult } from 'rev-models';
import { IReadMeta } from 'rev-models/lib/models/types';

import { withStyles, WithStyles, StyleRules, StyledComponentProps } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import { LinearProgress } from 'material-ui/Progress';
import Table, { TableHead, TableBody, TableRow, TableCell } from 'material-ui/Table';
import Typography from 'material-ui/Typography';

export interface IModelListProps {
    model: string;
    fields: string[];
}

export interface IModelListState {
    loadState: 'not_loaded' | 'loading' | 'loaded' | 'load_error';
    modelData?: IModelOperationResult<any, IReadMeta>;
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
    table: {
    },
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
            loadState: 'not_loaded'
        };
    }

    render() {

        if (this.state.loadState == 'not_loaded') {
            return (
                <Paper className={this.props.classes.root}>
                    <div className={this.props.classes.progressWrapper}>
                        <Typography type="display2">Loading...</Typography>
                        <LinearProgress className={this.props.classes.progressBar} />
                    </div>
                </Paper>
            );
        }
        else {
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
                    {['row1', 'row2', 'row2'].map((data, rowIdx) => {
                        return (
                            <TableRow key={rowIdx} hover>
                                {this.props.fields.map((fieldName, colIdx) => {
                                    // const field = this.modelMeta.fieldsByName[fieldName];
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
                    <Table className={this.props.classes.table}>
                        {tableHead}
                        {tableBody}
                    </Table>
                </Paper>
            );
        }
    }

    async componentDidMount() {
        if (this.state.loadState == 'not_loaded') {
            const modelData = await this.context.modelManager.read(this.modelMeta.ctor);
            if (modelData.success && modelData.results) {
                this.setState({
                    loadState: 'loaded',
                    modelData: modelData
                });
            }
        }
    }

}

export const ModelList: React.ComponentType<IModelListProps & StyledComponentProps>
    = withStyles(styles)(ModelListC);
