import type { SBRequestParamSchema, SBResponseSchema, OpenAPIMetadata, SBRequestBodySchema } from "..";
import type { OpenAPIV3_1 } from "openapi-types";

import { convertValidationSchemaToOpenAPI3_1Schema, SBRequest, SBResponse } from "..";

import { z } from "zod";
import { extendZodWithOpenApi } from "zod-openapi";

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
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | (string & NonNullable<unknown>);
    path: string;
    handler: RouteHandler;
    middlewares: Middleware[];
    errorHandlers: ErrorHandler[];
    validation?: RouteValidationOptions;
    openapi?: OpenAPIMetadata;
    run: (request: Request, params?: Record<string, string>) => Promise<Response>;
};

export type ErrorHandler = (error: unknown, req: SBRequest, res: SBResponse) => unknown;
export type Middleware = (req: SBRequest, res: SBResponse, next: () => unknown) => unknown;

/**
 * Route handler type for both middleware and route handler.
 */
export type RouteHandler<
    Params extends SBRequestParamSchema = SBRequestParamSchema,
    Query extends SBRequestParamSchema = SBRequestParamSchema,
    Body extends SBRequestBodySchema = SBRequestBodySchema,
    Headers extends SBRequestParamSchema = SBRequestParamSchema,
    Cookies extends SBRequestParamSchema = SBRequestParamSchema,
    Responses extends SBResponseSchema = SBResponseSchema,
> = (req: SBRequest<Params, Query, Body, Headers, Cookies>, res: SBResponse<Responses>) => unknown;

/**
 * Validation options for the route.
 */
export type RouteValidationOptions<
    Params extends SBRequestParamSchema = SBRequestParamSchema,
    Query extends SBRequestParamSchema = SBRequestParamSchema,
    Body extends SBRequestBodySchema = SBRequestBodySchema,
    Headers extends SBRequestParamSchema = SBRequestParamSchema,
    Cookies extends SBRequestParamSchema = SBRequestParamSchema,
    Responses extends SBResponseSchema = SBResponseSchema,
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
    Params extends SBRequestParamSchema = SBRequestParamSchema,
    Query extends SBRequestParamSchema = SBRequestParamSchema,
    Body extends SBRequestBodySchema = SBRequestBodySchema,
    Headers extends SBRequestParamSchema = SBRequestParamSchema,
    Cookies extends SBRequestParamSchema = SBRequestParamSchema,
    Responses extends SBResponseSchema = SBResponseSchema,
> = RouteValidationOptions<Params, Query, Body, Headers, Cookies, Responses> & {
    openapi?: OpenAPIMetadata;
};

/**
 * Type for route methods (GET, POST, PUT, DELETE, PATCH, OPTIONS) inside the Switchblade class.
 * This is binded in .get, .post, .put, .delete, .patch, .options methods.
 */
export type RouteMethod = <
    Params extends SBRequestParamSchema = SBRequestParamSchema,
    Query extends SBRequestParamSchema = SBRequestParamSchema,
    Body extends SBRequestBodySchema = SBRequestBodySchema,
    Headers extends SBRequestParamSchema = SBRequestParamSchema,
    Cookies extends SBRequestParamSchema = SBRequestParamSchema,
    Responses extends SBResponseSchema = SBResponseSchema,
>(
    path: string,
    handler: RouteHandler<Params, Query, Body, Headers, Cookies, Responses>,
    options?: RouteOptions<Params, Query, Body, Headers, Cookies, Responses>
) => Switchblade;

export class Switchblade {
    constructor(public config: SwitchbladeConfig = {}) {}

    /**
     * List of registered routes on Switchblade
     */
    routes: RegisteredRoute[] = [];

    /**
     * List of registered error handlers on Switchblade
     */
    errorHandlers: ErrorHandler[] = [];

    /**
     * List of registered middlewares on Switchblade
     */
    middlewares: Middleware[] = [];

    /**
     * Get the registered route by method and path
     * This is useful for testing
     *
     * @param method Route Method
     * @param path Route Registered Path
     *
     * @example
     * ```ts
     * describe('Example', () => {
     *     test('Get Specific User', async () => {
     *         const res = await app.getRoute("GET", "/user/:id").run(new Request(), { id: crypto.randomUUID() })
     *         expect(res.status).toBe(200)
     *     })
     * })
     * ```
     */
    getRoute(method: RegisteredRoute["method"], path: string): RegisteredRoute | undefined {
        return this.routes.find((route) => route.method === method && route.path === path);
    }

    /**
     * Generate OpenAPI 3.1 document based on routes and configurations
     *
     * @example
     * ```ts
     * // Set route for OpenAPI document API
     * app.get("/openapi.json", (req, res) => res.json(200, app.getOpenAPI31Document()))
     *
     * // Here we took an example using "hono" and "@scalar/hono-api-reference" package
     * // Set the swagger UI to use the published OpenAPI document API
     * hono.get("/swagger", Scalar({ url: "/openapi.json" }));
     */
    getOpenAPI3_1Document(): OpenAPIV3_1.Document {
        if (!this.config.openapi) {
            throw new Error("OpenAPI configuration is not provided.");
        }

        const document: OpenAPIV3_1.Document = {
            ...this.config.openapi,
            paths: {},
        };

        for (const route of this.routes) {
            if (route.openapi?.hide) continue; // Skip if route is hidden or openapi is not provided

            const fullPath = `${this.config?.basePath || ""}${route.path}`.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => `{${paramName}}`);
            if (!document.paths![fullPath]) document.paths![fullPath] = {};

            const metadata: OpenAPIV3_1.OperationObject = {
                ...(route.openapi || {}),
                responses: {},
                parameters: [],
            };

            if (route.validation?.body) {
                metadata.requestBody = {
                    required: route.validation.body.required,
                    description: route.validation.body.description || "",
                    summary: route.validation.body.summary || "",
                    content: {},
                };

                Object.entries(route.validation.body.content).forEach(([contentType, schema]) => {
                    (metadata.requestBody as OpenAPIV3_1.RequestBodyObject)!.content![contentType] = {
                        schema: convertValidationSchemaToOpenAPI3_1Schema(schema),
                    };
                });
            }

            const params: [SBRequestParamSchema | undefined, string][] = [
                [route.validation?.query, "query"],
                [route.validation?.params, "path"],
                [route.validation?.headers, "header"],
                [route.validation?.cookies, "cookie"],
            ];

            for (const [validation, inType] of params) {
                if (!validation) continue;

                Object.entries(validation).forEach(([key, schema]) => {
                    metadata.parameters!.push({
                        name: key,
                        in: inType,
                        required: inType === "path",
                        schema: convertValidationSchemaToOpenAPI3_1Schema(schema) as never,
                    });
                });
            }

            if (route.validation?.responses) {
                Object.entries(route.validation.responses).forEach(([statusCode, config]) => {
                    const response: OpenAPIV3_1.ResponseObject = {
                        description: (config as SBResponseSchema[number]).description || "",
                        content: {},
                        headers: {},
                    };

                    if (config.content) {
                        Object.entries(config.content).forEach(([contentType, schema]) => {
                            response.content![contentType] = {
                                schema: convertValidationSchemaToOpenAPI3_1Schema(schema),
                            };
                        });
                    }

                    if (config.headers) {
                        Object.entries(config.headers).forEach(([headerName, schema]) => {
                            response.headers![headerName] = {
                                schema: convertValidationSchemaToOpenAPI3_1Schema(schema) as never,
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

    /**
     * Set a middleware to intercept other middleware and
     * request handlers that are registered after it.
     *
     * @param middleware The middleware function
     *
     * @example
     * ```ts
     * app
     *    .use(middleware())
     *    .get("/users", handler) // Will be intercepted by the middleware
     * ```
     */
    use(middleware: Middleware): this {
        this.middlewares.push(middleware);
        return this;
    }

    /**
     * Set a error handler to intercept all errors that are thrown in the middleware and request handlers in the chain.
     * To make a global error handler, put this method to be the first one in the chain.
     *
     * @param handler The error handler function
     *
     * @example
     * ```ts
     * app
     *    .onError(errorHandler())
     *    // If an error is thrown in the middleware and the route handler, the previous
     *    // registered error handler will be used to handle the error
     *    .use(middleware())
     *    .get("/users", handler)
     * ```
     */
    onError(handler: ErrorHandler): this {
        this.errorHandlers.push(handler);
        return this;
    }

    /**
     * Register a new route to the Switchblade instance.
     * If the route already exists with the same method and path, it will throw an error.
     *
     * @param method GET, POST, PUT, DELETE, PATCH, OPTIONS
     * @param path The path to the route (follows the adapter format)
     * @param handler The route handler
     * @param options The route options
     */
    private define(method: RegisteredRoute["method"], path: string, handler: RouteHandler, options?: RouteOptions): this {
        if (this.routes.find((route) => route.method === method && route.path === path)) {
            throw new Error(`Route ${method} ${path} already exists.`);
        }

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const app = this;

        const route: RegisteredRoute = {
            method,
            path,
            handler,
            middlewares: [...this.middlewares],
            errorHandlers: [...this.errorHandlers],
            openapi: options?.openapi,
            validation: {
                body: options?.body,
                params: options?.params,
                query: options?.query,
                headers: options?.headers,
                responses: options?.responses,
                cookies: options?.cookies,
            },
            async run(request, params = {}) {
                const sbReq = new SBRequest(app, request, params as never, {
                    query: this.validation?.query,
                    params: this.validation?.params,
                    headers: this.validation?.headers,
                    body: this.validation?.body,
                    cookies: this.validation?.cookies,
                });

                const sbRes = new SBResponse(this.validation?.responses);

                try {
                    // Cache & validate the request params
                    sbReq.params;
                    sbReq.headers;
                    sbReq.query;
                    sbReq.cookies;

                    // Run the middlewares in order
                    let middlewareIndex = 0;

                    const run = async () => {
                        // If we've gone through all middlewares, execute the handler
                        if (middlewareIndex === this.middlewares.length) {
                            await this.handler(sbReq, sbRes);
                            return;
                        }

                        // Iterate through the middlewares
                        await this.middlewares[middlewareIndex++](sbReq, sbRes, run);
                    };

                    await run();
                    return sbRes.response || sbRes.end();
                } catch (error) {
                    for (const errorHandler of this.errorHandlers) {
                        await errorHandler(error, sbReq, sbRes);

                        if (sbRes.response instanceof Response) {
                            return sbRes.response;
                        }
                    }

                    // By default, if the error handler doesn't return a response,
                    // send a 500 error with "Internal Server Error" message
                    return sbRes.status(500).text("Internal Server Error");
                }
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

    /**
     * Group the routes inside to isolate it from the rest of the routes.
     *
     * @param path The base path to the routes inside the group
     * @param cb The sub instance of Switchblade
     *
     * @example
     * ```ts
     * app.group("/users", (group) => {
     *     return group
     *         .get("/", handler) // Will be registered as GET /users
     *         .patch("/:id", handler) // Will be registered as PATCH /users/:id
     * });
     * ```
     */
    group(path: string, cb: Switchblade | ((app: Switchblade) => Switchblade)): this {
        const subApp = cb instanceof Switchblade ? cb : new Switchblade(this.config);

        for (const route of subApp.routes) {
            this.routes.push({
                ...route,
                path: `${path}${route.path}`,
                middlewares: [...this.middlewares, ...route.middlewares],
                errorHandlers: [...this.errorHandlers, ...route.errorHandlers],
            });
        }

        return this;
    }
}
