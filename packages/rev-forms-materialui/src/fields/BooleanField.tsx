
import * as React from 'react';

import { FormControlLabel } from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';
import { IModelFieldComponentProps } from './types';

export const BooleanField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {

    let checked = props.value ? true : false;

    return (
        <FormControlLabel
            control={
                <Checkbox
                    name={props.field.name}
                    checked={checked}
                    onChange={(event, value) => props.onChange(value)}
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                    value="checkedB"
                />
            }
            label={props.field.options.label || props.field.name}
        />
    );
};
