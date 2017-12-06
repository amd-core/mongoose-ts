import { SchemaTypeOpts } from 'mongoose';

import * as ReflectUtils from './reflect-utils';

export function Field(options?: SchemaTypeOpts<any>): PropertyDecorator {
  return function FieldDecorator(target: Object, propertyKey: string | symbol) {
    ReflectUtils.SetFieldMetadata(target, propertyKey, options);
  }
}

export function Required(): PropertyDecorator {
  return function RequiredDecorator(target: Object, propertyKey: string | symbol) {
    ReflectUtils.SetFieldMetadata(target, propertyKey, { required: true });
  }
}

export function Unique(): PropertyDecorator {
  return function UniqueDecorator(target: Object, propertyKey: string | symbol) {
    ReflectUtils.SetFieldMetadata(target, propertyKey, <any>{
      index: {
        unique: true,
        dropDups: true
      }
    });
  }
}

export function Match(regex: RegExp): PropertyDecorator {
  return function MatchDecorator(target: Object, propertyKey: string | symbol) {
    ReflectUtils.SetFieldMetadata(target, propertyKey, {
      match: regex
    });
  }
}

export function Email(): PropertyDecorator {
  return Match(/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/);
}
