import type { DefaultRequestType, RequestSchema, SBRequest, DefaultResponsesType, ResponseSchema, SBResponse, OpenAPIMetadata } from "@/index";
import type { OpenAPIV3_1 } from "openapi-types";

import { z } from "zod";
import { extendZodWithOpenApi } from "zod-openapi";

import { convertSchemaToOpenAPISchema } from "@/index";

extendZodWithOpenApi(z);

/**
 * Configuration options for Switchblade.
 */
export type SwitchbladeConfig = {
    basePath?: string;
    openapi?: OpenAPIV3_1.Document;
};

/**
 * Registered route object.
 * This is the object that is returned when a route is registered.
 */
export type RegisteredRoute = {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";
    path: string;
    handler: RouteHandler;
    middlewares: RouteHandler[];
    validation?: RouteValidationOptions;
    openapi?: OpenAPIMetadata;
};

export type ErrorHandler = (error: unknown, req: SBRequest, res: SBResponse) => void | Promise<void> | Response | Promise<Response>;

/**
 * Route handler type for both middleware and route handler.
 */
export type RouteHandler<
    Params = DefaultRequestType, //
    Query = DefaultRequestType,
    Body = DefaultRequestType,
    Headers = DefaultRequestType,
    Cookies = DefaultRequestType,
    Responses extends DefaultResponsesType = DefaultResponsesType,
> = (req: SBRequest<Params, Query, Body, Headers, Cookies>, res: SBResponse<Responses>) => void | Promise<void> | Response | Promise<Response>;

/**
 * Validation options for the route.
 */
export type RouteValidationOptions<
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
 * Available options in the route methods.
 */
export type RouteOptions<
    Params extends RequestSchema = RequestSchema,
    Query extends RequestSchema = RequestSchema,
    Body extends RequestSchema = RequestSchema,
    Headers extends RequestSchema = RequestSchema,
    Cookies extends RequestSchema = RequestSchema,
    Responses extends ResponseSchema = ResponseSchema,
> = RouteValidationOptions<Params, Query, Headers, Body, Cookies, Responses> & {
    openapi?: OpenAPIMetadata;
};

/**
 * Type for route methods (GET, POST, PUT, DELETE, PATCH, OPTIONS) inside the Switchblade class.
 * This is binded in .get, .post, .put, .delete, .patch, .options methods.
 */
export type RouteMethod = <
    Params extends RequestSchema = RequestSchema,
    Query extends RequestSchema = RequestSchema,
    Body extends RequestSchema = RequestSchema,
    Headers extends RequestSchema = RequestSchema,
    Cookies extends RequestSchema = RequestSchema,
    Responses extends ResponseSchema = ResponseSchema,
>(
    path: string,
    handler: RouteHandler<Params, Query, Body, Headers, Cookies, Responses>,
    options?: RouteOptions<Params, Query, Headers, Body, Cookies, Responses>
) => Switchblade;

export class Switchblade {
    constructor(public config: SwitchbladeConfig = {}) {}

    routes: RegisteredRoute[] = [];
    errorHandlers: ErrorHandler[] = [];
    middlewares: RouteHandler[] = [];

    /**
     * Generate OpenAPI 3.1 document based on routes and configurations
     * @returns OpenAPI 3.1 document
     */
    getOpenAPI31Document(): OpenAPIV3_1.Document {
        if (!this.config.openapi) {
            throw new Error("OpenAPI configuration is not provided.");
        }

        const document: OpenAPIV3_1.Document = {
            ...this.config.openapi,
            paths: {},
        };

        for (const route of this.routes) {
            // Skip if route is hidden
            if (route.openapi?.hide) continue;

            const fullPath = `${this.config?.basePath || ""}${route.path}`;
            if (!document.paths![fullPath]) document.paths![fullPath] = {};

            const metadata: OpenAPIV3_1.OperationObject = {
                ...(route.openapi || {}),
                responses: {},
                parameters: [],
            };

            if (route.validation?.body) {
                const validationSchema: Record<string, OpenAPIV3_1.SchemaObject> = {};

                // Handle different content types
                Object.entries(route.validation.body).forEach(([key, schema]) => {
                    validationSchema[key] = convertSchemaToOpenAPISchema(schema);
                });

                metadata.requestBody = {
                    content: {
                        [route.openapi?.type || "application/json"]: {
                            schema: {
                                type: "object",
                                properties: validationSchema,
                            },
                        },
                    },
                };
            }

            if (route.validation?.query) {
                Object.entries(route.validation.query).forEach(([key, schema]) => {
                    metadata.parameters!.push({
                        name: key,
                        in: "query",
                        required: false,
                        description: "",
                        schema: convertSchemaToOpenAPISchema(schema) as never,
                    });
                });
            }

            if (route.validation?.params) {
                Object.entries(route.validation.params).forEach(([key, schema]) => {
                    metadata.parameters!.push({
                        name: key,
                        in: "path",
                        required: false,
                        description: "",
                        schema: convertSchemaToOpenAPISchema(schema) as never,
                    });
                });
            }

            if (route.validation?.headers) {
                Object.entries(route.validation.headers).forEach(([key, schema]) => {
                    metadata.parameters!.push({
                        name: key,
                        in: "header",
                        required: false,
                        description: "",
                        schema: convertSchemaToOpenAPISchema(schema) as never,
                    });
                });
            }

            if (route.validation?.cookies) {
                Object.entries(route.validation.cookies).forEach(([key, schema]) => {
                    metadata.parameters!.push({
                        name: key,
                        in: "cookie",
                        required: false,
                        description: "",
                        schema: convertSchemaToOpenAPISchema(schema) as never,
                    });
                });
            }

            if (route.validation?.responses) {
                Object.entries(route.validation.responses).forEach(([statusCode, config]) => {
                    const response: OpenAPIV3_1.ResponseObject = {
                        description: (config as DefaultResponsesType[number]).description || "",
                        content: {},
                        headers: {},
                        links: {},
                    };

                    if (config.content) {
                        Object.entries(config.content).forEach(([contentType, schema]) => {
                            response.content![contentType] = {
                                schema: convertSchemaToOpenAPISchema(schema),
                            };
                        });
                    }

                    if (config.headers) {
                        response.headers = {};
                        Object.entries(config.headers).forEach(([headerName, schema]) => {
                            response.headers![headerName] = {
                                description: "",
                                schema: convertSchemaToOpenAPISchema(schema) as never,
                            };
                        });
                    }

                    metadata.responses![statusCode] = response;
                });
            }

            // Add operation to the corresponding path and method
            // @ts-expect-error OpenAPI types are not strict
            document.paths[fullPath][route.method.toLowerCase() as Lowercase<RegisteredRoute["method"]>] = metadata;
        }

        return document;
    }

    use(middleware: RouteHandler) {
        this.middlewares.push(middleware);
        return this;
    }

    onError(handler: ErrorHandler) {
        this.errorHandlers.push(handler);
        return this;
    }

    private define(method: RegisteredRoute["method"], path: string, handler: RouteHandler, options?: RouteOptions) {
        if (this.routes.find((route) => route.method === method && route.path === path)) {
            throw new Error(`Route ${method} ${path} already exists.`);
        }

        const route: RegisteredRoute = {
            method,
            path,
            handler,
            middlewares: [...this.middlewares],
            openapi: options?.openapi,
            validation: {
                body: options?.body,
                params: options?.params,
                query: options?.query,
                headers: options?.headers,
                responses: options?.responses,
                cookies: options?.cookies,
            },
        };

        this.routes.push(route);
        return this;
    }

    get = this.define.bind(this, "GET") as RouteMethod;
    post = this.define.bind(this, "POST") as RouteMethod;
    put = this.define.bind(this, "PUT") as RouteMethod;
    delete = this.define.bind(this, "DELETE") as RouteMethod;
    patch = this.define.bind(this, "PATCH") as RouteMethod;
    options = this.define.bind(this, "OPTIONS") as RouteMethod;
    all = ((path: string, handler: RouteHandler, options?: RouteOptions) => {
        this.get(path, handler, options);
        this.post(path, handler, options);
        this.put(path, handler, options);
        this.delete(path, handler, options);
        this.patch(path, handler, options);
        this.options(path, handler, options);
        return this;
    }) as RouteMethod;

    group(path: string, cb: (app: Switchblade) => Switchblade) {
        const subApp = cb(new Switchblade({ ...this.config, basePath: path }));

        for (const route of subApp.routes) {
            this.routes.push({
                ...route,
                path: `${path}${route.path}`,
                middlewares: [...this.middlewares, ...route.middlewares],
            });
        }

        return this;
    }
}
