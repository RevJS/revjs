
import * as React from 'react';

import { withStyles, StyledComponentProps } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import { ISearchViewProps } from 'rev-ui/lib/views/SearchView';

const styles = withStyles({
    root: {
        width: '100%'
    }
});

type IMUISearchViewProps = ISearchViewProps & StyledComponentProps;

export const MUISearchView = styles<IMUISearchViewProps>((props) => {

    return (
        <Grid container spacing={8} style={props.style}>
            {props.children}
        </Grid>
    );

});
