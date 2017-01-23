
import * as React from 'react';

export default function TextField(props: any) {
    return (
        <div className="input-row">
            <input {...props.input} type="text"/>
            {props.meta.touched && props.meta.error &&
            <span className="error">{props.meta.error}</span>}
        </div>
    );
}
