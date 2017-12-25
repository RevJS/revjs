
import { models } from '../01_defining_a_model_manager';
import { Job } from './01_defining_related_models';
import { createJobs } from './02_creating_related_model_data';

(async function() {

    await createJobs();

    console.log('Related model data is not read by default...');
    const jobs = await models.read(Job);
    console.log(jobs.results);

    console.log('\nIndividual related fields can be loaded using the "related" read option');
    const jobsWithCompany = await models.read(Job, {}, { related: ['company'] });
    console.log(jobsWithCompany.results);

})();