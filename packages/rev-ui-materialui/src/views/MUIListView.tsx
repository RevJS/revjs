
import * as React from 'react';

import { withStyles, StyledComponentProps } from 'material-ui/styles';
import IconButton from 'material-ui/IconButton';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import Table, { TableHead, TableBody, TableRow, TableCell } from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { CircularProgress } from 'material-ui/Progress';
import { IListViewComponentProps } from 'rev-ui/lib/views/ListView';

const styles = withStyles({
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
});

type IMUIListViewProps = IListViewComponentProps & StyledComponentProps;

export const MUIListView = styles<IMUIListViewProps>((props) => {

    let paginationText = 'Loading';

    if (props.loadState == 'NONE') {
        paginationText = `Records ${props.firstRecordNumber}-${props.lastRecordNumber} of ${props.totalCount}`;
    }

    const toolbar = (
        <Toolbar className={props.classes.toolbar}>
            <Typography variant="title">{props.title}</Typography>
            <div className={props.classes.pagination}>
                <Typography variant="caption">
                    {paginationText}
                    {props.loadState == 'LOADING' &&
                        <CircularProgress size={20} style={{marginLeft: 15, verticalAlign: 'middle'}} />}
                </Typography>
                <IconButton
                    onClick={() => props.onBackButtonPress()}
                    disabled={props.backButtonDisabled}
                >
                    <KeyboardArrowLeft titleAccess="Previous Page" />
                </IconButton>
                <IconButton
                    onClick={() => props.onForwardButtonPress()}
                    disabled={props.forwardButtonDisabled}
                >
                    <KeyboardArrowRight titleAccess="Next Page" />
                </IconButton>
            </div>
        </Toolbar>
    );

    if (props.fields && props.fields.length) {

        const tableHead = (
            <TableHead>
                <TableRow>
                    {props.fields.map((field, idx) => {
                        return (
                            <TableCell key={idx} padding="dense">{field.options.label || field.name}</TableCell>
                        );
                    })}
                </TableRow>
            </TableHead>);

        const tableBody = props.records.length > 0 && (
            <TableBody>
                {props.records.map((record, rowIdx) => (

                    <TableRow
                        key={rowIdx} hover
                        onClick={() => props.onRecordPress(record)}
                    >
                        {props.fields.map((field, colIdx) => {
                            const data = record[field.name];
                            return (
                                <TableCell key={colIdx} padding="dense">{data ? data.toString() : ''}</TableCell>
                            );
                        })}
                    </TableRow>

                ))}
            </TableBody>
        );

        return (
            <div className={props.classes.root}>
                {toolbar}
                <Table className={props.classes.table}>
                    {tableHead}
                    {tableBody}
                </Table>
            </div>
        );

    }
    else {

        return (
            <div className={props.classes.root}>
                {toolbar}
            </div>
        );

    }

});
