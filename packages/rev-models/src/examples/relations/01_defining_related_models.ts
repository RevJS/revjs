
import * as rev from '../../index';
import { models } from '../01_defining_a_model_manager';

export class BaseModel<T> {
    constructor(data?: Partial<T>) {
        Object.assign(this, data);
    }
}

export class City extends BaseModel<City> {

    @rev.IntegerField({ primaryKey: true })
        id: number;
    @rev.TextField()
        name: string;
    @rev.TextField()
        code: string;
}

export class Company extends BaseModel<Company> {

    @rev.IntegerField({ primaryKey: true })
        id: number;
    @rev.TextField()
        name: string;
    @rev.RelatedModel({ model: 'City' })
        city: City;

}

export class Developer extends BaseModel<Developer> {

    @rev.IntegerField({ primaryKey: true })
        id: number;
    @rev.TextField({label: 'Name'})
        name: string;
    @rev.RelatedModelList({ model: 'Job', field: 'developer' })
        jobs: Job[];

}

export class Job extends BaseModel<Job> {

    @rev.RelatedModel({ model: 'Developer', required: false })
        developer: Developer;
    @rev.RelatedModel({ model: 'Company' })
        company: Company;
    @rev.TextField()
        job_title: string;
    @rev.DateField()
        date: string;

}

models.register(City);
models.register(Company);
models.register(Developer);
models.register(Job);
