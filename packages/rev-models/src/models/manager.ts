
import { initialiseMeta } from '../models/meta';
import { IModel, ModelCtor, IModelMeta } from '../models/types';
import { checkIsModelConstructor } from '../models/utils';
import { IBackend } from '../backends/backend';
import { IModelOperation } from '../operations/operation';
import { create } from '../operations/create';
import { update } from '../operations/update';
import { remove } from '../operations/remove';
import { read } from '../operations/read';
import { exec } from '../operations/exec';
import { IModelOperationResult } from '../operations/operationresult';
import { validate } from '../operations/validate';
import { IModelValidationResult } from '../validation/validationresult';
import { hydrate } from '../operations/hydrate';
import { IModelManager, IValidationOptions, ICreateOptions, ICreateMeta, IUpdateOptions, IUpdateMeta, IRemoveOptions, IRemoveMeta, IReadOptions, IReadMeta, IExecOptions } from './types';
import { isSet } from '../utils';

/**
 * A **Model Manager** has the following responsibilities:
 *
 * * Keep track of the current set of registered models and their metadata
 * * Keep track of the current set of registered [[IBackend]]s
 * * Provide Create, Read, Update, Delete and Validation functions for models
 *
 * The example below shows how to create a new model manager:
 *
 * ```ts
 * [[include:examples/src/model_manager/creating_a_model_manager.ts]]
 * ```
 */
export class ModelManager implements IModelManager {

    private _models: { [modelName: string]: IModelMeta<any> };
    private _backends: { [backendName: string]: IBackend };

    constructor() {
        this._models = {};
        this._backends = {};
    }

    /* Model Registration Functions */

    /**
     * Returns `true` if the specified model has been registered
     */
    isRegistered(modelName: string): boolean {
        return (modelName in this._models);
    }

    private assertModelNameIsRegistered(modelName: string) {
        if (!this.isRegistered(modelName)) {
            throw new Error(`ModelManagerError: Model '${modelName}' is not registered`);
        }
    }

    private assertModelClassIsRegistered(modelCtor: ModelCtor) {
        if (!modelCtor || !modelCtor.name) {
            throw new Error('ModelManagerError: Supplied object is not a model');
        }
        this.assertModelNameIsRegistered(modelCtor.name);
    }

    private assertModelIsRegistered(model: IModel) {
        this.assertModelClassIsRegistered(model.constructor as any);
    }

    /**
     * Registers a model class with the manager.
     *
     * A valid model class is any named ES6 class or constructor function.
     *
     * You can optionally provide a `meta` object along with the model class
     * to specify additional properties, such as which backend it should use, or
     * a more user-friendly label. See [[IModelMeta]] for more information about
     * the metadata that can be provided.
     *
     * The below example shows the creation of a model, and registering it with
     * a ModelModelManager:
     *
     * ```ts
     * [[include:examples/src/model_manager/registering_models.ts]]
     * ```
     *
     * @param model The class to register. Must be a class *constructor* **NOT an
     * instance**
     * @param meta Optional additional metadata about the model being registered
     */
    register<T extends IModel>(model: new(...args: any[]) => T, meta?: Partial<IModelMeta<T>>) {

        // Check model constructor
        checkIsModelConstructor(model);

        // Initialise model metadata
        let modelMeta = initialiseMeta(this, model, meta);

        // Check for duplicates
        if (modelMeta.name in this._models) {
            throw new Error(`ModelManagerError: Model '${modelMeta.name}' has already been registered.`);
        }

        // Add prototype and metadata to the registry
        this._models[modelMeta.name] = modelMeta;
    }

    /**
     * Returns the list of model namess currently registered
     */
    getModelNames(): string[] {
        return Object.keys(this._models);
    }

    /**
     * Returns the [[IModelMeta]] for the specified Model Name (string),
     * Class (constructor) or Model Instance.
     *
     * This is primarily for internal use, but may be useful if you wish to
     * inspect model metadata yourself.
     *
     * Throws an error if the specified model is not registered.
     *
     * @param model The model Name, Class or Instance to retrieve the metadata for
     */
    getModelMeta(model: string | ModelCtor | IModel) {
        let modelName: string;
        if (typeof model == 'string') {
            this.assertModelNameIsRegistered(model);
            modelName = model;
        }
        else if (typeof model == 'object') {
            this.assertModelIsRegistered(model);
            modelName = model.constructor.name;
        }
        else if (typeof model == 'function') {
            this.assertModelClassIsRegistered(model);
            modelName = model.name;
        }
        else {
            throw new Error('Invalid argument for getModelMeta()');
        }
        return this._models[modelName];
    }

    /* Backend Registration Functions */

    /**
     * Registers a backend to be used for model storage & retrieval. You must
     * provide a backend before registering models.
     *
     * The **backendName** you specify should correspond to the
     * [[IModelMeta.backend]] value you intend to use when registering models
     * with [[ModelModelManager.register]].
     *
     * If you are only using one backend, you can just use *default* as the
     * backend name, and there is no need to specify a backend name when
     * registering models.
     *
     * @param backendName A string identifier for the backend (e.g. 'default'
     * or 'customer_db')
     * @param backend A backend instance
     */
    registerBackend(backendName: string, backend: IBackend) {
        if (!backendName) {
            throw new Error('ModelManagerError: you must specify a name for the backend.');
        }
        if (!backend || typeof backend != 'object') {
            throw new Error('ModelManagerError: you must pass an instance of a backend class.');
        }
        if (typeof backend.create != 'function' || typeof backend.update != 'function'
            || typeof backend.read != 'function' || typeof backend.remove != 'function') {
            throw new Error('ModelManagerError: the specified backend does not fully implement the IBackend interface.');
        }
        this._backends[backendName] = backend;
    }

    /**
     * Returns a reference to a registered backend instance. Primarily for
     * internal use.
     *
     * Throws an error if the specified backend is not registered.
     *
     * @param backendName The backend string identifier
     */
    getBackend(backendName: string): IBackend {
        if (!backendName) {
            throw new Error('ModelManagerError: you must specify the name of the backend to get.');
        }
        if (!(backendName in this._backends)) {
            throw new Error(`ModelManagerError: Backend '${backendName}' has has not been configured.`);
        }
        return this._backends[backendName];
    }

    /**
     * Returns the list of backend names currently registered
     */
    getBackendNames(): string[] {
        return Object.keys(this._backends);
    }

    /**
     * Returns true if the model has no primaryKey value set (i.e. it is a 'new'
     * record)
     *
     * Throws an error if the model does not have a primaryKey field specified
     *
     * @param model An instance of a registered model to check
     */
    isNew<T extends IModel>(model: T) {
        const meta = this.getModelMeta(model);
        if (!meta.primaryKey) {
            throw new Error('ModelManagerError: isNew() can only be used with models that have a primaryKey field');
        }
        return !isSet(model[meta.primaryKey]);
    }

    /* Model CRUD Functions */

    /**
     * Creates a model record in the backend using the data from the passed
     * model instance.
     *
     * Below is an example of how to use the create method:
     *
     * ```ts
     * [[include:examples/src/defining_and_using_models/creating_and_reading_a_model.ts]]
     * ```
     *
     * @param model An instance of a registered model to be created in the
     * backend
     * @param options An optional set of options
     */
    create<T extends IModel>(model: T, options?: ICreateOptions): Promise<IModelOperationResult<T, ICreateMeta>> {
        return create(this, model, options);
    }

    /**
     * Updates a model record in the backend using the data from the passed
     * model instance.
     *
     * If the model has a primary key defined (see [[IModelMeta.primaryKey]])
     * then you only need to pass the model into this method.
     *
     * If the model does not have a primary key defined, then you'll need to
     * set the `where` option (see [[IUpdateOptions.where]])
     *
     * Below is an example of how to use the update method:
     *
     * ```ts
     * [[include:examples/src/defining_and_using_models/updating_data.ts]]
     * ```
     *
     * @param model An instance of a registered model containing the data to
     * be updated
     * @param options Options for the update
     */
    update<T extends IModel>(model: T, options?: IUpdateOptions): Promise<IModelOperationResult<T, IUpdateMeta>> {
        return update(this, model, options);
    }

    /**
     * Removes a model record from the backend using data from the passed model
     * instance.
     *
     * If the model has a primary key defined (see [[IModelMeta.primaryKey]])
     * then you only need to pass the model into this method.
     *
     * If the model does not have a primary key defined, then you'll need to
     * set the `where` option (see [[IUpdateOptions.where]])
     *
     * Below is an example of how to use the remove method:
     *
     * ```ts
     * [[include:examples/src/defining_and_using_models/removing_data.ts]]
     * ```
     * @param model An instance of a registered model containing the primary
     * key of the record to be removed. If you do not have an instance of the
     * record, just pass a new model instance and set `options.where`
     * @param options Options for the record removal
     */
    remove<T extends IModel>(model: T, options?: IRemoveOptions): Promise<IModelOperationResult<T, IRemoveMeta>> {
        return remove(this, model, options);
    }

    /**
     * Reads records from the backend which are filtered using the specified
     * **where** clause.
     *
     * Below is an example of how to use the read method:
     *
     * ```ts
     * [[include:examples/src/defining_and_using_models/searching_and_paging.ts]]
     * ```
     * @param model The Class constructor of the model to read
     * @param where The where clause (documentation of the query language TODO!)
     * @param options Options for record retrieval (e.g. record limit)
     */
    read<T extends IModel>(model: new() => T, options?: IReadOptions): Promise<IModelOperationResult<T, IReadMeta>> {
        return read(this, model, options);
    }

    /**
     * Validates the information currently stored in a model.
     *
     * NOTE: The `create` and `update` methods run validation before committing
     * changes to the backend, so you may not need to call this method yourself.
     *
     * Model validation proceeds as follows:
     * 1. Validate fields
     * 2. Validate model (using [[IModel.validateAsync]] and [[IModel.validate]])
     *
     * @param model The model instance to be validated
     * @param options Any options to use for the validation
     */
    validate<T extends IModel>(model: T, options?: IValidationOptions): Promise<IModelValidationResult> {
        let operation: IModelOperation = { operationName: 'validate' };
        return validate(this, model, operation, options);
    }

    /**
     * Executes a function on a model instance. If the function does not exist
     * in the current model, the execution is passed to the backend.
     *
     * This method is primarily used for calling server-side functions from a
     * client.
     *
     * @param model The model instance containing the data needed for this
     * method call
     * @param options Options for the for the method call, including the method
     * name and any arguments to pass
     */
    exec<R>(model: IModel, options: IExecOptions): Promise<IModelOperationResult<R, any>> {
        return exec(this, model, options);
    }

    /**
     * Returns a model instance based on its class and a javascript object
     * containing its data.
     *
     * This method is mainly used by backends for instantiating Model objects
     * based on data from a database or API.
     *
     * @param model The Class constructor of the model to read
     * @param data Any object containing the properties to be added to the model
     * instance
     */
    hydrate<T extends IModel>(model: new() => T, data: any): T {
        return hydrate(this, model, data);
    }

}
