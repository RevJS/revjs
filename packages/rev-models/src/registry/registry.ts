
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
 * A **Model Registry** has the following responsibilities:
 * 
 * * Keep track of the current set of registered [[Model]]s and their metadata
 * * Keep track of the current set of registered [[IBackend]]s
 * * Provide an easy way to perform actions on models (Create, Update, etc.)
 * 
 * The example below shows how to create a new model registry:
 *
 * ```ts
 * [[include:examples/01_defining_a_model_registry.ts]]
 * ```
 */
export class ModelRegistry {

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
            throw new Error(`RegistryError: Model '${modelName}' is not registered`);
        }
    }

    private assertModelClassIsRegistered<T extends Model>(modelCtor: new(...args: any[]) => T) {
        if (!modelCtor || !modelCtor.name) {
            throw new Error('RegistryError: Supplied object is not a model');
        }
        this.assertModelNameIsRegistered(modelCtor.name);
    }

    private assertModelIsRegistered<T extends Model>(model: T) {
        this.assertModelClassIsRegistered(model.constructor as any);
    }

    /**
     * Registers a [[Model]] class with the registry. See the [[Model]]
     * documentation for more information on creating RevJS Models.
     *
     * You can optionally provide a `meta` object along with the model class
     * to specify additional properties, such as which backend it should use, or
     * a more user-friendly label. See [[IModelMeta]] for more information about
     * the metadata that can be provided.
     *
     * The below example shows the creation of a model, and registering it with
     * a ModelRegistry:
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
            throw new Error(`RegistryError: Model '${modelName}' already exists in the registry.`);
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

    registerBackend(backendName: string, backend: IBackend) {
        if (!backendName) {
            throw new Error('RegistryError: you must specify a name for the backend.');
        }
        if (!backend || typeof backend != 'object') {
            throw new Error('RegistryError: you must pass an instance of a backend class.');
        }
        if (typeof backend.create != 'function' || typeof backend.update != 'function'
            || typeof backend.read != 'function' || typeof backend.remove != 'function') {
            throw new Error('RegistryError: the specified backend does not fully implement the IBackend interface.');
        }
        this._backends[backendName] = backend;
    }

    getBackend(backendName: string): IBackend {
        if (!backendName) {
            throw new Error('RegistryError: you must specify the name of the backend to get.');
        }
        if (!(backendName in this._backends)) {
            throw new Error(`RegistryError: Backend '${backendName}' has has not been configured.`);
        }
        return this._backends[backendName];
    }

    /**
     * Returns the list of backend names currently registered
     */
    getBackendNames(): string[] {
        return Object.keys(this._backends);
    }

    clearRegistry() {
        this._models = {};
        this._backends = {};
    }

    /* Model CRUD Functions */

    create<T extends Model>(model: T, options?: ICreateOptions): Promise<ModelOperationResult<T, ICreateMeta>> {
        return create(this, model, options);
    }

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
