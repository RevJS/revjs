
import express from 'express';
import { getFuncArgNames } from '../utils';

export default function(registryName, allowedModelsAndMethods, argParserFunc = null) {

    if (!registryName) {
        throw new Error("registryName parameter required to create express-api router");
    }
    if (!allowedModelsAndMethods) {
        throw new Error("allowedModelsAndMethods parameter required to create express-api router");
    }

    var router = express.Router();

    // All rev-framework api calls are currently done via POST
    // TODO: Support access by GET and ID to allow browser caching
    // TODO: Review this for possible security issues!
    
    router.post('/', function(req, res) {
        if (typeof req.body != 'object') {
            res.status(400).send('Bad Request');
            return;
        }
        else {
            var modelName = req.body.model;
            var methodName = req.body.method;
            var args = req.body.args || {};
            
            if (!modelName || !methodName || !args
                    || !(modelName in allowedModelsAndMethods)
                    || !(allowedModelsAndMethods[modelName].indexOf(methodName) > -1)) {
                res.status(400).send('Bad Request');
                return;
            }
            
            var registry = req.app.get(registryName);
            var model = registry.getModel(modelName);
            
            if (!(methodName in model) || typeof model[methodName] !== 'function') {
                res.status(400).send('Bad Request');
                return;
            }
            
            // Get API method arguments (we could cache this if needed)
            var argNames = getFuncArgNames(model[methodName]);

            // Fail if any invalid arguments are specified
            for (var argName in args) {
                if (!(argNames.indexOf(argName) > -1)) {
                    res.status(400).send('Bad Request');
                    return;
                }
            }
            
            // Run arg parser function if specified
            if (argParserFunc) {
                argParserFunc(req, modelName, methodName, args);
            }

            // Create clensed arg list (will insert undefined for any missing args)
            var argList = [];
            for (var i=0; i<argNames.length; i++) {
                argList.push(args[argNames[i]])
            }

            // Call function and return result once complete!
            var result = model[methodName].apply(model, argList);
            Promise.resolve(result)
                .then((result) => {
                    res.json({ result });
                })
                .catch((err) => {
                    res.status(500).send('An Error Occred');
                });
        }
    });

    return router;
}