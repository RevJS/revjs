
export const STANDARD_OPERATIONS = ['create', 'read', 'update', 'remove'];

export interface IModelOperation {
    operation: string;
    where?: object;
}
