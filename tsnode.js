
console.log('Launching', process.argv[2], 'with ts-node...');

require('ts-node').register();

require(process.argv[2]);

