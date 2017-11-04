
import * as React from 'react';

import MUITextField from 'material-ui/TextField';

import { IModelFieldComponentProps } from './types';

export const NumberField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {
    return (
        <MUITextField
            name={props.field.name}
            floatingLabelText={props.field.options.label || props.field.name}
            type="text"
            value={props.value}
            onChange={props.onChange}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            fullWidth={true}
        />
    );
};
