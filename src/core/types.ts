import type { SBRequest } from "./request";
import type { SBResponse } from "./response";
import type { TSchema, Static } from "@sinclair/typebox";
import type { z } from "zod";

// --------------------------------------
// Validation Schema Types & Inference
// Right now we only support Zod
// --------------------------------------
// TODO: Soon we can put other validation libraries here
// --------------------------------------
/**
 * Any accepted validation schema.
 * @warning Currently supports both TypeBox and Zod schemas.
 */
export type AnyValidationSchema = TSchema | z.ZodTypeAny | Record<string, unknown>;

/**
 * Infer the type of the validation schema for request object.
 * It's used for query, params, headers and body.
 * It'd infer the schema from Record<key, schema> to Record<key, type>.
 */
export type InferRequestSchema<T> = T extends object
    ? {
          [K in keyof T]: T[K] extends TSchema ? Static<T[K]> : T[K] extends z.ZodType<infer U> ? U : T[K];
      }
    : T extends TSchema
      ? Static<T>
      : T extends z.ZodType<infer U>
        ? U
        : T;

/**
 * Infer the type of the validation schema for response object.
 * The response schema differs from the request object which is a Record<key, schema>,
 * the response is directly the schema of the response.
 */
export type InferResponseSchema<T> = T extends TSchema ? Static<T> : T extends z.ZodTypeAny ? z.infer<T> : T;

// --------------------------------------
// Request Type & Validation
// --------------------------------------
/**
 * Default request type for the request object.
 * It's used for query, params, headers and body.
 * The default type is an empty object.
 */
export type DefaultRequestType = Record<string, unknown>;
/**
 * Validation schema for the request object.
 * It's used for query, params, headers and body.
 */
export type RequestSchema = Record<string, AnyValidationSchema>;

// --------------------------------------
// Request Type & Validation
// --------------------------------------
/**
 * Default response type for the response object.
 * It's used for the response object.
 * The mapping is [status code] => [content type] => [response type].
 */
export type DefaultResponsesType = Record<number, Record<string, unknown>>;
/**
 * Validation schema for the response object.
 * It's used for the response object.
 * The mapping is [status code] => [content type] => [response schema].
 */
export type ResponseSchema = Record<number, Record<string, AnyValidationSchema>>;

// --------------------------------------
// Route Type
// --------------------------------------
export type ErrorHandler = (error: unknown, req: SBRequest, res: SBResponse) => void | Promise<void>;
export type Middleware = (req: SBRequest, res: SBResponse) => void | Promise<void>;
export type RouteHandler<
    Params = DefaultRequestType, //
    Query = DefaultRequestType,
    Body = DefaultRequestType,
    Headers = DefaultRequestType,
    Cookies = DefaultRequestType,
    Responses extends DefaultResponsesType = DefaultResponsesType,
> = (req: SBRequest<Params, Query, Body, Headers, Cookies>, res: SBResponse<Responses>) => void | Promise<void> | Response | Promise<Response>;

// --------------------------------------
// OpenAPI Metadata
// --------------------------------------
/**
 * OpenAPI metadata for the route.
 * This then will be formatted to OpenAPI spec.
 * @see https://swagger.io/specification/
 */
export type OpenAPIMetadata = {
    summary?: string;
    description?: string;
    tags?: string[];
    deprecated?: boolean;
    operationId?: string;
    externalDocs?: {
        description?: string;
        url: string;
    };
};

// --------------------------------------
// Utility Types
// --------------------------------------
/**
 * Validation options for the route.
 */
export type ValidationOptions<
    Params extends RequestSchema = RequestSchema,
    Query extends RequestSchema = RequestSchema,
    Body extends RequestSchema = RequestSchema,
    Headers extends RequestSchema = RequestSchema,
    Cookies extends RequestSchema = RequestSchema,
    Responses extends ResponseSchema = ResponseSchema,
> = {
    params?: Params;
    query?: Query;
    headers?: Headers;
    body?: Body;
    cookies?: Cookies;
    responses?: Responses;
};
/**
 * Type for the route `options` parameter.
 */
export type RouteOptions<
    Params extends RequestSchema = RequestSchema,
    Query extends RequestSchema = RequestSchema,
    Body extends RequestSchema = RequestSchema,
    Headers extends RequestSchema = RequestSchema,
    Cookies extends RequestSchema = RequestSchema,
    Responses extends ResponseSchema = ResponseSchema,
> = ValidationOptions<Params, Query, Headers, Body, Cookies, Responses> & {
    openapi?: OpenAPIMetadata;
};
/**
 * Options for the cookie set.
 */
export type CookieOptions = {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None" | boolean;
    path?: string;
    domain?: string;
    expires?: Date;
    signed?: boolean;
};
