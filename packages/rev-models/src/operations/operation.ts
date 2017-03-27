import { IWhereQuery } from '../queries/query';

export interface IModelOperation {
    name: string;
    where?: IWhereQuery;
}
