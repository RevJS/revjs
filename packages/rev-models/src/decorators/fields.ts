import * as fld from '../fields';
import { ITextFieldBaseOptions, ITextFieldOptions } from '../fields/textfields';
import { INumberFieldOptions } from '../fields/numberfields';
import { IFieldOptions } from '../fields/field';
import { ISelectFieldOptions } from '../fields/selectionfields';

/* RevModel Field Decorators */

function addFieldMeta(
        target: any,
        fieldName: string,
        descriptor: PropertyDescriptor,
        fieldClass: new(...args: any[]) => fld.Field,
        options: IFieldOptions
    ) {

    if (!target.hasOwnProperty('__fields')) {
        let fields = [];
        if (target.__fields) {
            fields = target.__fields.slice();
        }
        Object.defineProperty(target, '__fields', {
            enumerable: false, value: fields
        });
    }
    if (!options) {
        options = {};
    }
    if (descriptor && descriptor.get && typeof options.stored == 'undefined') {
        // We assume properties with Getters do not need to be stored
        options.stored = false;
    }
    target.__fields.push(new fieldClass(fieldName, options));
}

// Text Fields

/**
 * Use the **@TextField()** decorator to add a TextField to your model
 *
 * ```ts
 * import { TextField } from 'rev-models';
 *
 * class MyClass {
 *     @TextField({ multiLine: false, maxLength: 30 })
 *         name: string;
 * }
 * ```
 * @param options Options for the TextField
 */
export function TextField(options?: ITextFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.TextField, options);
    };
}

/**
 * Use the **@PasswordField()** decorator to add a PasswordField to your model
 *
 * ```ts
 * import { PasswordField } from 'rev-models';
 *
 * class MyClass {
 *     @PasswordField({ minLength: 10 })
 *         password: string;
 * }
 * ```
 * @param options Options for the PasswordField
 */
export function PasswordField(options?: ITextFieldBaseOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.PasswordField, options);
    };
}

/**
 * Use the **@EmailField()** decorator to add an EmailField to your model
 *
 * ```ts
 * import { EmailField } from 'rev-models';
 *
 * class MyClass {
 *     @EmailField()
 *         email: string;
 * }
 * ```
 * @param options Options for the EmailField
 */
export function EmailField(options?: ITextFieldBaseOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.EmailField, options);
    };
}

/**
 * Use the **@URLField()** decorator to add a URLField to your model
 *
 * ```ts
 * import { URLField } from 'rev-models';
 *
 * class MyClass {
 *     @URLField()
 *         website: string;
 * }
 * ```
 * @param options Options for the URLField
 */
export function URLField(options?: ITextFieldBaseOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.URLField, options);
    };
}

// Number Fields

/**
 * Use the **@NumberField()** decorator to add a NumberField to your model
 *
 * ```ts
 * import { NumberField } from 'rev-models';
 *
 * class MyClass {
 *     @NumberField()
 *         amount: number;
 * }
 * ```
 * @param options Options for the NumberField
 */
export function NumberField(options?: INumberFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.NumberField, options);
    };
}

/**
 * Use the **@IntegerField()** decorator to add an IntegerField to your model
 *
 * ```ts
 * import { IntegerField } from 'rev-models';
 *
 * class MyClass {
 *     @IntegerField()
 *         quantity: number;
 * }
 * ```
 * @param options Options for the IntegerField
 */
export function IntegerField(options?: INumberFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.IntegerField, options);
    };
}

/**
 * Use the **@AutoNumberField()** decorator to add an AutoNumberField to your model
 *
 * ```ts
 * import { AutoNumberField } from 'rev-models';
 *
 * class MyModel {
 *     @AutoNumberField()
 *         id: number;
 * }
 * ```
 * @param options Options for the AutoNumberField
 */
export function AutoNumberField(options?: IFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.AutoNumberField, options);
    };
}

// Selection Fields

/**
 * Use the **@BooleanField()** decorator to add a BooleanField to your model
 *
 * ```ts
 * import { BooleanField } from 'rev-models';
 *
 * class MyModel {
 *     @BooleanField()
 *         is_awesome: boolean;
 * }
 * ```
 * @param options Options for the BooleanField
 */
export function BooleanField(options?: IFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.BooleanField, options);
    };
}

/**
 * Use the **@SelectField()** decorator to add a SelectField to your model
 *
 * ```ts
 * import { SelectField } from 'rev-models';
 *
 * const priorities = [
 *     ['low', 'Low'],
 *     ['medium', 'Medium'],
 *     ['high', 'High']
 * ];
 *
 * class MyModel {
 *     @SelectField({ selection: priorities })
 *         priority: string;
 * }
 * ```
 * @param options Options for the SelectField
 */
export function SelectField(options: ISelectFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.SelectField, options);
    };
}

/**
 * Use the **@MultiSelectField()** decorator to add a MultiSelectField to your model
 *
 * ```ts
 * import { MultiSelectField } from 'rev-models';
 *
 * const fruit = [
 *     ['apples', 'Apples'],
 *     ['oranges', 'Oranges'],
 *     ['bananas', 'Bananas']
 * ];
 *
 * class MyModel {
 *     @MultiSelectField({ selection: fruit })
 *         priority: string;
 * }
 * ```
 * @param options Options for the MultiSelectField
 */
export function MultiSelectField(options: ISelectFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.MultiSelectField, options);
    };
}

// Date & Time Fields

/**
 * Use the **@DateField()** decorator to add a DateField to your model
 *
 * ```ts
 * import { DateField } from 'rev-models';
 *
 * class MyModel {
 *     @DateField()
 *         date_registered: string;
 * }
 * ```
 * @param options Options for the DateField
 */
export function DateField(options?: IFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.DateField, options);
    };
}

/**
 * Use the **@TimeField()** decorator to add a TimeField to your model
 *
 * ```ts
 * import { TimeField } from 'rev-models';
 *
 * class MyModel {
 *     @TimeField()
 *         entry_time: string;
 * }
 * ```
 * @param options Options for the TimeField
 */
export function TimeField(options?: IFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.TimeField, options);
    };
}

/**
 * Use the **@DateTimeField()** decorator to add a DateTimeField to your model
 *
 * ```ts
 * import { DateTimeField } from 'rev-models';
 *
 * class MyModel {
 *     @DateTimeField()
 *         login_datetime: string;
 * }
 * ```
 * @param options Options for the DateTimeField
 */
export function DateTimeField(options?: IFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.DateTimeField, options);
    };
}

// Record Fields

/**
 * Use the **@RelatedModel()** decorator to add a RelatedModelField to your model
 *
 * ```ts
 * import { RelatedModel } from 'rev-models';
 *
 * class MyModel {
 *     @RelatedModel({ model: 'City' })
 *         city: City;
 * }
 * ```
 * @param options Options for the RelatedModelField
 */
export function RelatedModel(options: fld.IRelatedModelFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.RelatedModelField, options);
    };
}

/**
 * Use the **@RelatedModelList()** decorator to add a RelatedModelListField to
 * your model
 *
 * ```ts
 * import { RelatedModelList } from 'rev-models';
 *
 * class City {
 *     @RelatedModelList({ model: 'Customer', field: 'city' })
 *         customers: Customer[];
 * }
 * ```
 * @param options Options for the RelatedModelListField
 */
export function RelatedModelList(options: fld.IRelatedModelListFieldOptions)
{
    return function(target: any, propName: string, descriptor?: PropertyDescriptor) {
        addFieldMeta(target, propName, descriptor, fld.RelatedModelListField, options);
    };
}
