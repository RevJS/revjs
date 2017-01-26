import * as fld from '../fields';
import { ITextFieldOptions } from '../fields/textfields';
import { INumberFieldOptions } from '../fields/numberfields';
import { IFieldOptions } from '../fields/field';
import { ISelectionFieldOptions } from '../fields/selectionfields';

/* RevModel Field Decorators */

function addFieldMeta(target: any, fieldName: string, fieldObj: fld.Field) {
    if (!target.__fields) {
        target.__fields = [];
    }
    target.__fields.push(fieldObj);
}

// Text Fields

export function TextField(label: string, options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.TextField(propName, label, options));
    };
}

export function PasswordField(label: string, options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.PasswordField(propName, label, options));
    };
}

export function EmailField(label: string, options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.EmailField(propName, label, options));
    };
}

export function URLField(label: string, options?: ITextFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.URLField(propName, label, options));
    };
}

// Number Fields

export function NumberField(label: string, options?: INumberFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.NumberField(propName, label, options));
    };
}

export function IntegerField(label: string, options?: INumberFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.IntegerField(propName, label, options));
    };
}

// Selection Fields

export function BooleanField(label: string, options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.BooleanField(propName, label, options));
    };
}

export function SelectionField(label: string, selection: string[][], options?: ISelectionFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.SelectionField(propName, label, selection, options));
    };
}

// Date & Time Fields

export function DateField(label: string, options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.DateField(propName, label, options));
    };
}

export function TimeField(label: string, options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.TimeField(propName, label, options));
    };
}

export function DateTimeField(label: string, options?: IFieldOptions)
{
    return function(target: any, propName: string) {
        addFieldMeta(target, propName, new fld.DateTimeField(propName, label, options));
    };
}
