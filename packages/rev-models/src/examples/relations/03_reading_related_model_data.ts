
import { models } from '../01_defining_a_model_manager';
import { Job } from './01_defining_related_models';
import { createJobs } from './02_creating_related_model_data';

(async function() {

    await createJobs();

    console.log('Jobs without related record data...');
    const jobs = await models.read(Job);
    console.log(jobs.results);

})();