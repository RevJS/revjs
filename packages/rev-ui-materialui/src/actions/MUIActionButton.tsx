
import * as React from 'react';

import { IActionComponentProps } from 'rev-ui/lib/actions/types';
import Button from 'material-ui/Button';

export const MUIActionButton: React.SFC<IActionComponentProps> = (props) => {

    const childContent = props.children || props.label;

    return (
        <Button raised color="primary"
            onClick={() => props.doAction()}
            style={{ margin: 12 }}
            disabled={props.disabled}
        >
            {childContent}
        </Button>
    );

};
