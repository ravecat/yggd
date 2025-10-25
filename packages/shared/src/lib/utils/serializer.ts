import JSONAPISerializer from 'json-api-serializer';
import { schemas } from '../schemas.js';
import type { ResourceType, Resources } from '../types.js';

const serializer = new JSONAPISerializer();

serializer.register('post');
serializer.register('user');

/**
 * Type-safe deserializer with runtime validation using Zod
 * Automatically validates and infers types based on resource type
 *
 * @throws {z.ZodError} If validation fails
 */
export function deserialize<T extends ResourceType>(
  type: T,
  data: unknown
): Resources[T][] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deserialized = serializer.deserialize(type, data as any);

  const normalized = Array.isArray(deserialized) ? deserialized : [deserialized];

  return schemas[type].parse(normalized) as Resources[T][];
}
