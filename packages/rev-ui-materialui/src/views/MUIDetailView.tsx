
import * as React from 'react';

import { withStyles, StyledComponentProps } from 'material-ui/styles';

import Grid from 'material-ui/Grid';
import { IDetailViewProps } from 'rev-ui/lib/views/DetailView';

const styles = withStyles({
    root: {
        width: '100%'
    }
});

type IMUIDetailViewProps = IDetailViewProps & StyledComponentProps;

export const MUIDetailView = styles<IMUIDetailViewProps>((props) => {

    return (
        <Grid container spacing={8}>
            {props.children}
        </Grid>
    );

});
