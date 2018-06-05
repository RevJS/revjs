
import * as React from 'react';

import { withStyles, StyledComponentProps } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
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
        paginationText = `${props.firstItemNumber}-${props.lastItemNumber} of ${props.totalCount}`;
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

        const tableBody = props.results.length > 0 && (
            <TableBody>
                {props.results.map((model, rowIdx) => (

                    <TableRow
                        key={rowIdx} hover
                        onClick={() => props.onItemPress(model)}
                    >
                        {props.fields!.map((field, colIdx) => {
                            const data = model[field.name];
                            return (
                                <TableCell key={colIdx} padding="dense">{data ? data.toString() : ''}</TableCell>
                            );
                        })}
                    </TableRow>

                ))}
            </TableBody>
        );

        return (
            <div className={props.classes.root} style={props.style}>
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
            <div className={props.classes.root} style={props.style}>
                {toolbar}
            </div>
        );

    }

});
