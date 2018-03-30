
import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';

export function getGridWidthProps(props: IFieldComponentProps | ISearchFieldComponentProps) {
    return {
        xs: props.colspanNarrow,
        md: props.colspan,
        lg: props.colspanWide
    };
}