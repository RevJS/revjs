import { IWhereQuery } from '../queries/query';

export interface IModelOperation {
    operation: string;
    where?: IWhereQuery;
}
