import type { AnyValidationSchema } from "..";
import type { OpenAPIV3_1 } from "openapi-types";

import { TypeGuard } from "@sinclair/typebox";
import { ZodSchema } from "zod";
import { createSchema } from "zod-openapi";

/**
 * OpenAPI metadata for the route.
 * This then will be formatted to OpenAPI spec.
 * @see https://swagger.io/specification
 */
export type OpenAPIMetadata = {
    hide?: boolean;
    summary?: string;
    description?: string;
    tags?: string[];
    deprecated?: boolean;
    type?: string;
    externalDocs?: {
        description?: string;
        url: string;
    };
};

/**
 * Converts a Zod or TypeBox schema to an OpenAPI V3.1 schema
 *
 * @param schema Zod or TypeBox schema
 */
export function convertValidationSchemaToOpenAPI3_1Schema(schema: AnyValidationSchema): OpenAPIV3_1.SchemaObject {
    // Handle Zod schemas
    if (schema instanceof ZodSchema) {
        return createSchema(schema).schema as OpenAPIV3_1.SchemaObject;
    }

    // Handle TypeBox schemas
    if (TypeGuard.IsSchema(schema)) {
        const openAPISchema: OpenAPIV3_1.SchemaObject = {
            type: schema.type,
            ...(schema.title ? { title: schema.title } : {}),
            ...(schema.description ? { description: schema.description } : {}),
        };

        // Add additional constraints for string
        if (TypeGuard.IsString(schema)) {
            if (schema.minLength !== undefined) openAPISchema.minLength = schema.minLength;
            if (schema.maxLength !== undefined) openAPISchema.maxLength = schema.maxLength;
        }

        // Add additional constraints for number
        if (TypeGuard.IsNumber(schema)) {
            if (schema.minimum !== undefined) openAPISchema.minimum = schema.minimum;
            if (schema.maximum !== undefined) openAPISchema.maximum = schema.maximum;
        }

        return openAPISchema;
    }

    // Fallback for unsupported schemas
    return { type: "object" };
}
