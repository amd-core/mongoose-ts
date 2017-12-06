import { SchemaTypeOpts } from 'mongoose';

export function IsNativeKey(key: PropertyKey): boolean {
  return (
    key === 'length' ||
    key === 'name' ||
    key === 'prototype'
  );
}

export function GetCustomKeys(target: Object): Array<PropertyKey> {
  return Reflect.ownKeys(target).filter((key: PropertyKey) => {
    return (!IsNativeKey(key));
  });
}

export function GetFieldType(target: Object, fieldName: string | symbol): any {
  return Reflect.getMetadata('design:type', target, fieldName);
}

export function SetFieldMetadata(target: Object, fieldName: string | symbol, fieldMetadata?: SchemaTypeOpts<any>): void {
  let currentMetadata: object = Reflect.get(target.constructor, fieldName);

  if (!currentMetadata) {
    currentMetadata = {
      type: GetFieldType(target, fieldName)
    };
  }

  Reflect.set(target.constructor, fieldName, Object.assign({}, currentMetadata, fieldMetadata));
}
