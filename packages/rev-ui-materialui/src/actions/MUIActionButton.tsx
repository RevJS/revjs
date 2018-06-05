
import * as React from 'react';

import { IActionComponentProps } from 'rev-ui/lib/actions/types';
import Button from '@material-ui/core/Button';

export const MUIActionButton: React.SFC<IActionComponentProps> = (props) => {

    const childContent = props.children || props.label;

    return (
        <Button variant="raised" color="primary"
            onClick={() => props.doAction()}
            disabled={props.disabled}
            style={props.style}
        >
            {childContent}
        </Button>
    );

};
