import type { Static, TSchema } from "@sinclair/typebox";
import type { z } from "zod";

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
    if (schema && typeof schema === "object" && "type" in schema) {
        try {
            // Use TypeBox Value to validate
            const isValid = Value.Check(schema as TSchema, data);

            if (!isValid) {
                // If validation fails, throw an error with details
                const errors = [...Value.Errors(schema as TSchema, data)];
                throw new SBValidationError(`TypeBox validation failed: ${JSON.stringify(errors)}`);
            }

            return data;
        } catch (error) {
            throw new SBValidationError(`TypeBox validation error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // Handle object schemas (for TypeBox and potentially other schema types)
    if (schema && typeof schema === "object") {
        // Check if it's a complex TypeBox object schema
        const schemaEntries = Object.entries(schema);

        if (schemaEntries.length > 0 && schemaEntries.every(([, val]) => val && typeof val === "object" && "type" in val)) {
            try {
                const result: Record<string, unknown> = {};
                for (const [key, subSchema] of schemaEntries) {
                    const isValid = Value.Check(subSchema as TSchema, (data as Record<string, unknown>)[key]);

                    if (!isValid) {
                        const errors = [...Value.Errors(subSchema as TSchema, (data as Record<string, unknown>)[key])];
                        throw new SBValidationError(`Validation failed for key ${key}: ${JSON.stringify(errors)}`);
                    }

                    result[key] = (data as Record<string, unknown>)[key];
                }
                return result;
            } catch (error) {
                throw new SBValidationError(`TypeBox object schema validation error: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    throw new SBValidationError("Unsupported validation schema");
};

export class SBValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SBValidationError";
    }
}
