
import * as React from 'react';

import { withStyles, StyledComponentProps } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import { IDetailViewProps } from 'rev-ui/lib/views/DetailView';

const styles = withStyles({
    root: {
        width: '100%'
    }
});

type IMUIDetailViewProps = IDetailViewProps & StyledComponentProps;

export const MUIDetailView = styles<IMUIDetailViewProps>((props) => {

    return (
        <Grid container spacing={8} style={props.style}>
            {props.children}
        </Grid>
    );

});
