
import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';

import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { getGridWidthProps } from './utils';
import { ISelectFieldOptions } from 'rev-models/lib/fields';

export const MUIMultiSelectField: React.StatelessComponent<IFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    let error = props.errors.length > 0;
    let errorText = '';
    props.errors.forEach((err) => {
        errorText += err.message + '. ';
    });

    const opts: ISelectFieldOptions = props.field.options;

    function getOptionDesc(code: string) {
        const opt = opts.selection.find((option) => option[0] == code);
        if (opt) {
            return opt[1];
        }
        return '';
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
                <Select
                    multiple
                    value={props.value || []}
                    renderValue={(selected: any) =>
                        selected.map(getOptionDesc).join(', ')}
                    onChange={(event) => {
                        props.onChange(event.target.value);
                    }}
                    inputProps={{
                        id: fieldId
                    }}
                    error={error}
                    disabled={props.disabled}
                >
                    {opts.selection.map(([code, text], index) => (
                        <MenuItem key={index} value={code}>
                            <Checkbox checked={props.value ? props.value.indexOf(code) > -1 : false} />
                            <ListItemText primary={text} />
                        </MenuItem>
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
