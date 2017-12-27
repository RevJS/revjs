
import { models } from '../01_defining_a_model_manager';
import { Company, Developer, Job } from './01_defining_related_models';

export async function createJobs() {

    const company1 = new Company({
        id: 1,
        name: 'Aztec Inc'
    });
    await models.create(company1);

    const company2 = new Company({
        id: 2,
        name: 'MBI Ltd'
    });
    await models.create(company2);

    const developer = new Developer({
        id: 1,
        name: 'Bob Dev'
    });
    await models.create(developer);

    /**
     * To create record links, simply pass a reference to the record in the
     * appropriate model field. RevJS will use the primary key of the linked
     * record to create the link
     */
    const job1 = new Job({
        developer: developer,
        company: company1,
        job_title: 'Junior Developer',
        date: '2012-01-02'
    });
    await models.create(job1);

    const job2 = new Job({
        developer: developer,
        company: company2,
        job_title: 'Intermediate Developer',
        date: '2016-03-04'
    });
    await models.create(job2);

    const job3 = new Job({
        developer: null,
        company: company2,
        job_title: 'Principal VB.Net Engineer',
        date: '2017-05-12'
    });
    await models.create(job3);

}
