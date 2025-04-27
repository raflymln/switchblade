import type { Static, TSchema } from "@sinclair/typebox";
import type { z } from "zod";

import { TypeGuard } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { ZodSchema } from "zod";

/**
 * Any accepted validation schema.
 * @warning Currently supports both TypeBox and Zod schemas.
 */
export type AnyValidationSchema = TSchema | z.ZodTypeAny | Record<string, unknown>;

/**
 * Infer the type of the validation schema from any accepted validation schema.
 * @warning Currently supports both TypeBox and Zod schemas.
 */
export type InferValidationSchema<T> = T extends TSchema ? Static<T> : T extends z.ZodTypeAny ? z.infer<T> : T;

/**
 * Infer the type of the validation schema from a Record<key, schema> to Record<key, type>.
 */
export type InferValidationSchemaInRecord<T> = T extends object
    ? {
          [K in keyof T]: InferValidationSchema<T[K]>;
      }
    : never;

/**
 * Validate the data with the given schema.
 *
 * @param schema Any accepted validation schema (Zod or TypeBox)
 * @param data Data to be validated
 * @returns Parsed data or throws an error if validation fails
 */
export const validate = (schema: AnyValidationSchema, data: unknown) => {
    // Check for Zod schema
    if (schema instanceof ZodSchema) {
        return schema.parse(data);
    }

    // Check for TypeBox schema
    if (TypeGuard.IsSchema(schema)) {
        return Value.Parse(schema, data);
    }

    throw new Error("Unsupported validation schema");
};
