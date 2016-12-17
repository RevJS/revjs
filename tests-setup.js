
require("ts-node").register();

require("./src/polyfills");

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
