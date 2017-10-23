
import * as React from 'react';

import MUITextField from 'material-ui/TextField';

import { IModelFieldComponentProps } from './types';

export const NumberField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {
    return (
        <MUITextField
            name={props.field.name}
            floatingLabelText={props.field.options.label || props.field.name}
            type="text"
            value={props.input.value}
            onChange={props.input.onChange}
            onFocus={props.input.onFocus}
            onBlur={props.input.onBlur}
            fullWidth={true}
        />
    );
};
