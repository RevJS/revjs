
import * as rev from '../../index';

export class Company {

    @rev.TextField()
        name: string;

}

export class Developer {

    @rev.IntegerField({ primaryKey: true })
        id: number;
    @rev.TextField({label: 'Name'})
        name: string;
    @rev.RecordListField({ model: 'Job' })
        jobs: Job[];

}

export class Job {

    @rev.RecordField({ model: 'Developer' })
        developer: Developer;
    @rev.RecordField({ model: 'Company' })
        company: Company;
    @rev.TextField()
        job_title: string;
    @rev.DateField()
        date: string;

}