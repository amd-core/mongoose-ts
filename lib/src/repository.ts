import {
  Document as MongooseDocument,
  Model as MongooseModel,
  Query as MongooseQuery
} from 'mongoose';

import { registerService } from './container';
import { ModelSymbol } from './symbols';

export interface IQueryOptions {
  select?: string;
  populate?: string;
  sort?: string;
  pagination?: {
    rowsPerPage: number;
    currentPage: number;
  };
}

export function Repository<T>(entity: T): ClassDecorator {
  return function RepositoryDecorator<T extends Function>(constructor: T): T {
    const model = Reflect.getMetadata(ModelSymbol, entity);
    Reflect.defineMetadata(ModelSymbol, model, constructor);

    registerService(constructor);
    return constructor;
  }
}

export class AbstractRepository<T extends MongooseDocument> {
  public model: MongooseModel<T>;

  constructor() {
    this.model = Reflect.getMetadata(ModelSymbol, this.constructor);
  }

  public create(doc?: Partial<T>): T {
    return new this.model(Object(doc));
  }

  public add(doc?: Partial<T>): Promise<T> {
    return this.create(doc).save();
  }

  public find(criteria: Partial<T>, options?: IQueryOptions): Promise<Array<T>> {
    let query: MongooseQuery<Array<T>> = this.model.find(Object(criteria));
    if (options) { this.buildQuery(query, options); }
    return query.exec();
  }

  public findOne(criteria: Partial<T>): Promise<T | null> {
    return this.model.findOne(Object(criteria)).exec();
  }

  public findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  public removeById(id: string): Promise<T | null> {
    return this.model.findByIdAndRemove(id).exec();
  }

  public update(id: string, data: Partial<T>): Promise<T> {
    if (data === null || data === undefined) {
      throw new Error(`The provided data is undefined`);
    }

    return this.findById(id)
      .then((doc: T | null) => {
        if (doc === null || doc === undefined) {
          throw new Error(`Object with ID: ${id} does not exist.`);
        }

        Object.keys(data).forEach((key: string) => {
          if (!(key in doc)) {
            throw new Error(`The key: ${key} does not exist in the target document`);
          }

          if (!(key in data)) {
            throw new Error(`The key: ${key} does not exist in the provided document`);
          }

          if (data.get === null || data.get === undefined) {
            throw new Error(`The method: get() does not exist on the provided document`);
          }

          doc.set(key, data.get(key));
        });

        return doc.save();
      });
  }

  public buildQuery(query: MongooseQuery<T | Array<T>>, options: IQueryOptions): MongooseQuery<T | Array<T>> {
    if (options.select) { query.select(options.select); }
    if (options.populate) { query.select(options.populate); }
    if (options.sort) { query.select(options.sort); }

    if (options.pagination) {
      query.limit(options.pagination.rowsPerPage);
      query.skip(options.pagination.rowsPerPage * options.pagination.currentPage);
    }

    return query;
  }
}
