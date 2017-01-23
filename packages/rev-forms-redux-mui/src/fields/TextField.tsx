
import * as React from 'react';

// import TextField from 'material-ui/TextField';

export default function TextField(props: any) {
    return (
        <div className="input-row">
            {/* <TextField hintText="Username" fullWidth={true} /> */}
            <input {...props.input} type="text"/>
            {props.meta.touched && props.meta.error &&
            <span className="error">{props.meta.error}</span>}
        </div>
    );
}
