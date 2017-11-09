import * as fld from '../fields';
import { ITextFieldOptions } from '../fields/textfields';
import { INumberFieldOptions } from '../fields/numberfields';
import { IFieldOptions } from '../fields/field';
import { ISelectionFieldOptions } from '../fields/selectionfields';

/* RevModel Field Decorators */

function addFieldMeta(target: any, fieldName: string, fieldObj: fld.Field) {
    if (!target.__fields) {
        Object.defineProperty(target, '__fields', {
            enumerable: false, value: []
        });
    }
    target.__fields.push(fieldObj);
}

// Text Fields

export function TextField(options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.TextField(propName, options));
    };
}

export function PasswordField(options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.PasswordField(propName, options));
    };
}

export function EmailField(options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.EmailField(propName, options));
    };
}

export function URLField(options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.URLField(propName, options));
    };
}

// Number Fields

export function NumberField(options?: INumberFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.NumberField(propName, options));
    };
}

export function IntegerField(options?: INumberFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.IntegerField(propName, options));
    };
}

export function AutoNumberField(options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.AutoNumberField(propName, options));
    };
}

// Selection Fields

export function BooleanField(options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.BooleanField(propName, options));
    };
}

export function SelectionField(options: ISelectionFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.SelectionField(propName, options));
    };
}

// Date & Time Fields

export function DateField(options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.DateField(propName, options));
    };
}

export function TimeField(options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.TimeField(propName, options));
    };
}

export function DateTimeField(options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.DateTimeField(propName, options));
    };
}

// Record Fields

export function RecordField(options: fld.IRecordFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.RecordField(propName, options));
    };
}

export function RecordListField(options: fld.IRecordFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.RecordListField(propName, options));
    };
}
