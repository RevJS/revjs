
import { models } from '../01_defining_a_model_manager';
import { Job, Developer } from './01_defining_related_models';
import { createJobs } from './02_creating_related_model_data';

(async function() {

    await createJobs();

    console.log('Related model data is not read by default...');

    const jobs = await models.read(Job);
    console.log(jobs.results);

    console.log('\nRelated data can be loaded using the "related" read option...');

    const jobsWithRelated = await models.read(Job, {}, {
        related: [ 'company', 'developer' ]
    });
    console.log(jobsWithRelated.results);

    const developersWithJobs = await models.read(Developer, {}, {
        related: [ 'jobs' ]
    });
    console.log(developersWithJobs.results[0]);

    console.log('\nYou can also load deeply nested data by using dot notation with the "related" option...');

    const jobsWithDeepData = await models.read(Job, {}, {
        related: [ 'company.city' ]
    });
    console.log(jobsWithDeepData.results);

    console.log('\nYou can filter based on related record IDs...');

    const jobsWithNoDeveloper = await models.read(Job, {
        developer: { _eq: null }
    }, {
        related: [ 'company', 'developer' ]
    });
    console.log(jobsWithNoDeveloper.results);

    console.log('\nYou can alternatively read raw ID values using the "rawValues" option...');

    const jobsWithRawIds = await models.read(Job, {}, {
        rawValues: [ 'company', 'developer' ]
    });
    console.log(jobsWithRawIds.results);
    console.log(jobsWithRawIds.meta);
})();