
export const STANDARD_OPERATIONS = ['create', 'read', 'update', 'remove'];

export interface IModelOperation {
    operationName: string;
    where?: object;
}
