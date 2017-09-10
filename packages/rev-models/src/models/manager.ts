
import { initialiseMeta, IModelMeta } from '../models/meta';
import { Model, ModelCtor } from '../models/model';
import { checkIsModelConstructor } from '../models/utils';
import { IBackend } from '../backends/backend';
import { IModelOperation } from '../operations/operation';
import { create, ICreateOptions, ICreateMeta } from '../operations/create';
import { update, IUpdateOptions, IUpdateMeta } from '../operations/update';
import { remove, IRemoveOptions, IRemoveMeta } from '../operations/remove';
import { read, IReadOptions, IReadMeta } from '../operations/read';
import { ModelOperationResult } from '../operations/operationresult';
import { validate, IValidationOptions } from '../operations/validate';
import { ModelValidationResult } from '../validation/validationresult';
import { IExecOptions, exec, IExecArgs } from '../operations/exec';

/**
 * A **Model Manager** has the following responsibilities:
 *
 * * Keep track of the current set of registered [[Model]]s and their metadata
 * * Keep track of the current set of registered [[IBackend]]s
 * * Provide Create, Read, Update, Delete and Validation functions for models
 *
 * The example below shows how to create a new model manager:
 *
 * ```ts
 * [[include:examples/01_defining_a_model_manager.ts]]
 * ```
 */
export class ModelManager {

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

    private assertModelClassIsRegistered<T extends Model>(modelCtor: new(...args: any[]) => T) {
        if (!modelCtor || !modelCtor.name) {
            throw new Error('ModelManagerError: Supplied object is not a model');
        }
        this.assertModelNameIsRegistered(modelCtor.name);
    }

    private assertModelIsRegistered<T extends Model>(model: T) {
        this.assertModelClassIsRegistered(model.constructor as any);
    }

    /**
     * Registers a [[Model]] class with the manager. See the [[Model]]
     * documentation for more information on creating RevJS Models.
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
     * [[include:examples/02_defining_a_model.ts]]
     * ```
     *
     * @param model The class to register. Must be a class *constructor* **NOT an
     * instance**
     * @param meta Optional additional metadata about the model being registered
     */
    register<T extends Model>(model: new(...args: any[]) => T, meta?: IModelMeta<T>) {

        // Check model constructor
        checkIsModelConstructor(model);
        let modelName = model.name;
        if (this.isRegistered(modelName)) {
            throw new Error(`ModelManagerError: Model '${modelName}' has already been registered.`);
        }

        // Initialise model metadata
        let modelMeta = initialiseMeta(this, model, meta);

        // Add prototype and metadata to the registry
        this._models[modelName] = modelMeta;
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
    getModelMeta(model: string | ModelCtor | Model) {
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

    /* Model CRUD Functions */

    /**
     * Creates a model record in the backend using the data from the passed
     * model instance.
     *
     * Below is an example of how to use the create method:
     *
     * ```ts
     * [[include:examples/03_creating_and validating_data.ts]]
     * ```
     *
     * @param model An instance of a registered model to be created in the
     * backend
     * @param options An optional set of options
     */
    create<T extends Model>(model: T, options?: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>> {
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
     * @param model An instance of a registered model containing the data to
     * be updated
     * @param options Options for the update
     */
    update<T extends Model>(model: T, options?: IUpdateOptions): Promise<ModelOperationResult<T, IUpdateMeta>> {
        return update(this, model, options);
    }

    remove<T extends Model>(model: T, options?: IRemoveOptions): Promise<ModelOperationResult<T, IRemoveMeta>> {
        return remove(this, model, options);
    }

    read<T extends Model>(model: new() => T, where?: object, options?: IReadOptions): Promise<ModelOperationResult<T, IReadMeta>> {
        return read(this, model, where, options);
    }

    validate<T extends Model>(model: T, options?: IValidationOptions): Promise<ModelValidationResult> {
        let operation: IModelOperation = { operation: 'validate' };
        return validate(this, model, operation, options);
    }

    exec<R>(model: Model, method: string, argObj?: IExecArgs, options?: IExecOptions): Promise<ModelOperationResult<R, any>> {
        return exec(this, model, method, argObj, options);
    }

}
