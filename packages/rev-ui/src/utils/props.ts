import * as React from 'react';

/**
 * @private
 */
export interface IStandardComponentProps {
    style?: Partial<React.CSSProperties>;
}

/**
 * @private
 */
export function getStandardProps(props: any) {
    const sProps: IStandardComponentProps = {};
    function addProp(propName: keyof IStandardComponentProps) {
        if (typeof props[propName] != 'undefined') {
            sProps[propName] = props[propName];
        }
    }
    addProp('style');
    return sProps;
}