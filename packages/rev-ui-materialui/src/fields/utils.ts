
import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';

export function getGridWidthProps(props: IFieldComponentProps) {
    return {
        xs: props.colspanNarrow,
        md: props.colspan,
        lg: props.colspanWide
    };
}