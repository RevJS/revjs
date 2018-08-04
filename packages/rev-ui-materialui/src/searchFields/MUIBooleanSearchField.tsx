
import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';
import { getGridWidthProps } from '../fields/utils';
import { IObject } from 'rev-models/lib/utils/types';

export const MUIBooleanSearchField: React.StatelessComponent<ISearchFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    let value = '';
    const criteria: IObject = props.criteria;
    if (criteria && typeof criteria['_eq'] != 'undefined') {
        value = criteria['_eq'] == true ? 'Y' : 'N';
    }

    return (
        <Grid item {...gridWidthProps} style={props.style}>

            <FormControl fullWidth>
                <InputLabel
                    htmlFor={fieldId}
                    shrink={true}
                >
                    {props.label}
                </InputLabel>
                <Select
                    value={value}
                    onChange={(event) => {
                        const val = event.target.value;
                        if (val == 'Y') {
                            props.onCriteriaChange({ _eq: true });
                        }
                        else if (val == 'N') {
                            props.onCriteriaChange({ _eq: false });
                        }
                        else {
                            props.onCriteriaChange(null);
                        }
                    }}
                    inputProps={{
                        id: fieldId
                    }}
                >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value="Y">Yes</MenuItem>
                    <MenuItem value="N">No</MenuItem>
                </Select>
            </FormControl>

        </Grid>
    );
};
