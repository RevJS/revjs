
import * as React from 'react';

import { withStyles, WithStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import { IDetailViewProps } from 'rev-ui/lib/views/DetailView';

const styles = {
    root: {
        width: '100%'
    }
};

type IMUIDetailViewProps = IDetailViewProps & WithStyles<typeof styles>;

export const MUIDetailView: React.ComponentType<any> = withStyles(styles)(
    class extends React.Component<IMUIDetailViewProps> {

        constructor(props: IMUIDetailViewProps) {
            super(props);
            this.handleSubmit.bind(this);
        }

        handleSubmit(e: React.FormEvent<HTMLFormElement>) {
            e.preventDefault();
        }

        render() {
            return (
                <form onSubmit={this.handleSubmit} style={this.props.style}>
                    <Grid container spacing={8}>
                        {this.props.children}
                    </Grid>
                </form>
            );
        }

    }
);