import {
  SchemaDefinition, SchemaOptions,
  Schema as MongooseSchema,
  Model as MongooseModel,
  model as CreateMongooseModel
} from 'mongoose';

import * as ReflectUtils from './reflect-utils';
import { ModelSymbol } from './symbols';

export interface IMongoosePlugin {
  (schema: MongooseSchema, options?: Object): void;
}

export interface ISchemaDefinitionOptionsPlugin {
  plugin: IMongoosePlugin;
  options?: Object;
}

export interface ISchemaDefinitionOptions extends SchemaOptions {
  name?: string;
  plugins?: Array<ISchemaDefinitionOptionsPlugin>
}

export function Entity(options?: ISchemaDefinitionOptions): ClassDecorator {
  return function DocumentDecorator<T extends Function>(constructor: T): T {

    let schemaDefinition: SchemaDefinition = {};

    ReflectUtils.GetCustomKeys(constructor)
      .forEach((key: PropertyKey) => schemaDefinition[key] = Reflect.get(constructor, key));

    const schemaName: string = (options && options.name) || Reflect.get(constructor, 'name');
    const schema: MongooseSchema = new MongooseSchema(schemaDefinition);
    schema.loadClass(constructor);

    if (options && options.plugins) {
      options.plugins.forEach((pluginDefinition: ISchemaDefinitionOptionsPlugin) => {
        schema.plugin(pluginDefinition.plugin, pluginDefinition.options);
      });
    }

    const model: MongooseModel<any> = CreateMongooseModel(schemaName, schema);
    Reflect.defineMetadata(ModelSymbol, model, constructor);

    return constructor;
  }
}
