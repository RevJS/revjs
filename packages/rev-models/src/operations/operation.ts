
export const STANDARD_OPERATIONS = ['create', 'read', 'update', 'remove'];

/**
 * Metadata about the current operation. Provided as part of a
 * [[ModelOperationResult]] and also to [[IFieldValidator]]s amd
 * [[IAsyncFieldValidator]]s
 */
export interface IModelOperation {
    /**
     * The current operation name (e.g. `'create'` or `'update'`)
     */
    operationName: string;
    /**
     * The `where` clause associated with the current operation
     */
    where?: object;
}
