
import { models } from '../01_defining_a_model_manager';
import { Company, Developer, Job } from './01_defining_related_models';

(async function() {

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

    // We don't currently support creation of records
    // with lists of sub records
    const developer = new Developer({
        id: 1,
        name: 'Bob Dev'
    });
    await models.create(developer);

    // Instead you should just create the related records
    // directly, as shown below
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

})();
