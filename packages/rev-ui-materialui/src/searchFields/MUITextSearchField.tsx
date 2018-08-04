
import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';

import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';
import { getGridWidthProps } from '../fields/utils';
import { IObject } from 'rev-models/lib/utils/types';

// Text Search Field - does a basic 'contains' search
export const MUITextSearchField: React.StatelessComponent<ISearchFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    let type = 'text';

    let value = '';
    const criteria: IObject = props.criteria;
    if (criteria && typeof criteria['_like'] == 'string') {
        // We assume the current criteria starts and ends with a '%'
        value = criteria['_like'].substr(1, criteria['_like'].length - 2);
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
                <Input
                    id={fieldId}
                    type={type}
                    value={value}
                    onChange={(event) => {
                        const val = event.target.value;
                        if (val) {
                            props.onCriteriaChange({ _like: '%' + event.target.value + '%'});
                        }
                        else {
                            props.onCriteriaChange(null);
                        }
                    }}
                />
            </FormControl>

        </Grid>
    );
};
