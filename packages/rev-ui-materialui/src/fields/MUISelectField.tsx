
import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { getGridWidthProps } from './utils';
import { ISelectFieldOptions } from 'rev-models/lib/fields';

export const MUISelectField: React.StatelessComponent<IFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    let error = props.errors.length > 0;
    let errorText = '';
    props.errors.forEach((err) => {
        errorText += err.message + '. ';
    });

    const opts: ISelectFieldOptions = props.field.options;

    return (
        <Grid item {...gridWidthProps} style={props.style}>

            <FormControl fullWidth>
                <InputLabel
                    htmlFor={fieldId}
                    error={error}
                >
                    {props.label}
                </InputLabel>
                <Select
                    value={props.value || ''}
                    onChange={(event) => props.onChange(event.target.value || null)}
                    inputProps={{
                        id: fieldId
                    }}
                    error={error}
                    disabled={props.disabled}
                >
                    <MenuItem value=""></MenuItem>
                    {opts.selection.map(([code, text], index) => (
                        <MenuItem key={index} value={code}>{text}</MenuItem>
                    ))}
                </Select>
                {errorText &&
                    <FormHelperText error>
                        {errorText}
                    </FormHelperText>}
            </FormControl>

        </Grid>
    );
};
