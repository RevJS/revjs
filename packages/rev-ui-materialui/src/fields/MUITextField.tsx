
import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';

import { PasswordField, ITextFieldOptions } from 'rev-models/lib/fields';
import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { getGridWidthProps } from './utils';

export const MUITextField: React.StatelessComponent<IFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    let type = 'text';
    if (props.field instanceof PasswordField) {
        type = 'password';
    }

    let error = props.errors.length > 0;
    let errorText = '';
    props.errors.forEach((err) => {
        errorText += err.message + '. ';
    });

    const opts: ITextFieldOptions = props.field.options;
    const mlOptions: any = {};
    if (opts.multiLine) {
        mlOptions.multiline = true;
        mlOptions.rowsMax = 5;
        mlOptions.rows = 5;
    }

    return (
        <Grid item {...gridWidthProps} style={props.style}>

            <FormControl fullWidth>
                <InputLabel
                    htmlFor={fieldId}
                    error={error}
                >
                    {props.label}
                </InputLabel>
                <Input
                    id={fieldId}
                    type={type}
                    value={props.value || ''}
                    onChange={(event) => props.onChange(event.target.value)}
                    error={error}
                    disabled={props.disabled}
                    {...mlOptions}
                />
                {errorText &&
                    <FormHelperText error>
                        {errorText}
                    </FormHelperText>}
            </FormControl>

        </Grid>
    );
};
