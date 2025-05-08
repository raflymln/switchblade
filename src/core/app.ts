import type { SBRequestParamSchema, SBResponseSchema, OpenAPIMetadata, SBRequestBodySchema, SBRequestHeaders } from "..";
import type { OpenAPIV3_1 } from "openapi-types";

import { convertValidationSchemaToOpenAPI3_1Schema, SBRequest, SBResponse } from "..";

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
    middlewares: RegisteredMiddleware[];
    errorHandlers: ErrorHandler[];
    /** OpenAPI metadata of the current route. */
    openAPI?: OpenAPIMetadata;
    /** Merged OpenAPI metadata from the route and middlewares. */
    mergedOpenAPI?: OpenAPIMetadata;
    /** Validation schema of the current route. */
    validation?: RouteValidationOptions;
    /** Merged validation schema from the route and middlewares. */
    mergedValidation?: RouteValidationOptions;
    run: (request: Request, params?: Record<string, string>) => Promise<Response>;
};

/**
 * Registered middleware object.
 * This is the object that is returned when a middleware is registered.
 */
export type RegisteredMiddleware = {
    handler: Middleware;
    validation?: Omit<RouteValidationOptions, "responses">; // Middleware doesn't have responses
    openapi?: OpenAPIMetadata;
};

export type ErrorHandler = (error: unknown, req: SBRequest, res: SBResponse) => unknown;

/**
 * Middleware type for Switchblade.
 */
export type Middleware<
    Params extends SBRequestParamSchema = SBRequestParamSchema,
    Query extends SBRequestParamSchema = SBRequestParamSchema,
    Body extends SBRequestBodySchema = SBRequestBodySchema,
    Headers extends SBRequestHeaders = SBRequestHeaders,
    Cookies extends SBRequestParamSchema = SBRequestParamSchema,
    Responses extends SBResponseSchema = SBResponseSchema,
> = (req: SBRequest<Params, Query, Body, Headers, Cookies>, res: SBResponse<Responses>, next: () => unknown) => unknown;

/**
 * Route handler type for both middleware and route handler.
 */
export type RouteHandler<
    Params extends SBRequestParamSchema = SBRequestParamSchema,
    Query extends SBRequestParamSchema = SBRequestParamSchema,
    Body extends SBRequestBodySchema = SBRequestBodySchema,
    Headers extends SBRequestHeaders = SBRequestHeaders,
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
    Headers extends SBRequestHeaders = SBRequestHeaders,
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
    Headers extends SBRequestHeaders = SBRequestHeaders,
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
    Headers extends SBRequestHeaders = SBRequestHeaders,
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
     * If the current instance is used inside the group, or as any sub instance,
     * this will return the parent Switchblade instance.
     *
     * But if the current instance is the parent, it will return itself.
     */
    getParentInstance = (): Switchblade => this;

    /**
     * Get the original instance of Switchblade.
     * When used in the nested-nested group, this will always return the original instance.
     */
    getOriginalInstance = (): Switchblade => this;

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
    middlewares: RegisteredMiddleware[] = [];

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
        const instance = this.getOriginalInstance();

        if (!instance.config.openapi) {
            throw new Error("OpenAPI configuration is not provided.");
        }

        const document: OpenAPIV3_1.Document = {
            ...instance.config.openapi,
            paths: {},
        };

        for (const route of instance.routes) {
            if (route.mergedOpenAPI?.hide) continue; // Skip if route is hidden or openapi is not provided

            const fullPath = `${instance.config?.basePath || ""}${route.path}`.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => `{${paramName}}`);
            if (!document.paths![fullPath]) document.paths![fullPath] = {};

            const metadata: OpenAPIV3_1.OperationObject = {
                ...(route.mergedOpenAPI || {}),
                responses: {},
                parameters: [],
            };

            if (route.mergedValidation?.body) {
                metadata.requestBody = {
                    required: route.mergedValidation.body.required,
                    description: route.mergedValidation.body.description || "",
                    summary: route.mergedValidation.body.summary || "",
                    content: {},
                };

                Object.entries(route.mergedValidation.body.content).forEach(([contentType, schema]) => {
                    (metadata.requestBody as OpenAPIV3_1.RequestBodyObject)!.content![contentType] = {
                        schema: convertValidationSchemaToOpenAPI3_1Schema(schema),
                    };
                });
            }

            const params: [SBRequestParamSchema | SBRequestHeaders | undefined, string][] = [
                [route.mergedValidation?.query, "query"],
                [route.mergedValidation?.params, "path"],
                [route.mergedValidation?.headers, "header"],
                [route.mergedValidation?.cookies, "cookie"],
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

            if (route.mergedValidation?.responses) {
                Object.entries(route.mergedValidation.responses).forEach(([statusCode, config]) => {
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
     * @param options The middleware options (same as route options except responses)
     *
     * @example
     * ```ts
     * app
     *    .use(middleware())
     *    .get("/users", handler) // Will be intercepted by the middleware
     * ```
     */
    use<
        Params extends SBRequestParamSchema = SBRequestParamSchema,
        Query extends SBRequestParamSchema = SBRequestParamSchema,
        Body extends SBRequestBodySchema = SBRequestBodySchema,
        Headers extends SBRequestHeaders = SBRequestHeaders,
        Cookies extends SBRequestParamSchema = SBRequestParamSchema,
    >(middleware: Middleware<Params, Query, Body, Headers, Cookies>, options?: Omit<RouteOptions<Params, Query, Body, Headers, Cookies>, "responses">): this {
        this.middlewares.push({
            handler: middleware as never,
            validation: {
                body: options?.body,
                params: options?.params,
                query: options?.query,
                headers: options?.headers,
                cookies: options?.cookies,
            },
            openapi: options?.openapi,
        });
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
     * @param method GET, POST, PUT, DELETE, PATCH, OPTIONS or any other HTTP method
     * @param path The path to the route (follows the adapter format)
     * @param handler The route handler
     * @param options The route options
     */
    route<
        Params extends SBRequestParamSchema = SBRequestParamSchema,
        Query extends SBRequestParamSchema = SBRequestParamSchema,
        Body extends SBRequestBodySchema = SBRequestBodySchema,
        Headers extends SBRequestHeaders = SBRequestHeaders,
        Cookies extends SBRequestParamSchema = SBRequestParamSchema,
        Responses extends SBResponseSchema = SBResponseSchema,
    >(
        method: RegisteredRoute["method"],
        path: string,
        handler: RouteHandler<Params, Query, Body, Headers, Cookies, Responses>,
        options?: RouteOptions<Params, Query, Body, Headers, Cookies, Responses>
    ): this {
        if (this.routes.find((route) => route.method === method && route.path === path)) {
            throw new Error(`Route ${method} ${path} already exists.`);
        }

        path = path.trim();

        if (path === "") {
            path = "/";
        }

        if (!path.startsWith("/")) {
            path = `/${path}`;
        }

        if (path !== "/" && path.endsWith("/")) {
            path = path.slice(0, -1);
        }

        const getApp = () => this.getOriginalInstance();

        const route: RegisteredRoute = {
            method,
            path,
            handler: handler as never,
            middlewares: [...this.middlewares],
            errorHandlers: [...this.errorHandlers],
            openAPI: options?.openapi,
            get mergedOpenAPI() {
                const meta = {} as OpenAPIMetadata;

                for (const middleware of this.middlewares) {
                    if (middleware.openapi) {
                        Object.assign(meta, middleware.openapi);
                    }
                }

                if (this.openAPI) {
                    Object.assign(meta, this.openAPI);
                }

                return Object.keys(meta).length > 0 ? meta : undefined;
            },
            validation: {
                body: options?.body,
                params: options?.params,
                query: options?.query,
                headers: options?.headers,
                responses: options?.responses,
                cookies: options?.cookies,
            },
            get mergedValidation() {
                const body = { content: {} } as SBRequestBodySchema;
                const params = {} as SBRequestParamSchema;
                const query = {} as SBRequestParamSchema;
                const headers = {} as SBRequestHeaders;
                const cookies = {} as SBRequestParamSchema;
                const responses = this.validation?.responses; // Middleware doesn't have responses

                for (const middleware of this.middlewares) {
                    if (middleware.validation?.body) {
                        body.content = middleware.validation.body.content;
                        body.required = middleware.validation.body.required;
                        body.description = middleware.validation.body.description;
                        body.summary = middleware.validation.body.summary;
                        Object.assign(body.content, middleware.validation.body.content);
                    }

                    if (middleware.validation?.params) {
                        Object.assign(params, middleware.validation.params);
                    }

                    if (middleware.validation?.query) {
                        Object.assign(query, middleware.validation.query);
                    }

                    if (middleware.validation?.headers) {
                        Object.assign(headers, middleware.validation.headers);
                    }

                    if (middleware.validation?.cookies) {
                        Object.assign(cookies, middleware.validation.cookies);
                    }
                }

                if (this.validation?.body) {
                    Object.assign(body, this.validation.body);
                }

                if (this.validation?.params) {
                    Object.assign(params, this.validation.params);
                }

                if (this.validation?.query) {
                    Object.assign(query, this.validation.query);
                }

                if (this.validation?.headers) {
                    Object.assign(headers, this.validation.headers);
                }

                if (this.validation?.cookies) {
                    Object.assign(cookies, this.validation.cookies);
                }

                return {
                    body: Object.keys(body.content).length > 0 ? body : undefined,
                    params: Object.keys(params).length > 0 ? params : undefined,
                    query: Object.keys(query).length > 0 ? query : undefined,
                    headers: Object.keys(headers).length > 0 ? headers : undefined,
                    cookies: Object.keys(cookies).length > 0 ? cookies : undefined,
                    responses: Object.keys(responses || {}).length > 0 ? responses : undefined,
                };
            },
            async run(request, params = {}) {
                const sbReq = new SBRequest(getApp(), request, params as never, {
                    query: this.mergedValidation?.query,
                    params: this.mergedValidation?.params,
                    headers: this.mergedValidation?.headers,
                    body: this.mergedValidation?.body,
                    cookies: this.mergedValidation?.cookies,
                });

                const sbRes = new SBResponse(this.mergedValidation?.responses);

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
                        await this.middlewares[middlewareIndex++].handler(sbReq, sbRes, run);
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

    get = this.route.bind(this, "GET") as RouteMethod;
    post = this.route.bind(this, "POST") as RouteMethod;
    put = this.route.bind(this, "PUT") as RouteMethod;
    delete = this.route.bind(this, "DELETE") as RouteMethod;
    patch = this.route.bind(this, "PATCH") as RouteMethod;
    options = this.route.bind(this, "OPTIONS") as RouteMethod;
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
     * @param options The route options (same as route options except responses)
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
    group(path: string, cb: Switchblade | ((app: Switchblade) => Switchblade), options?: Omit<RouteOptions, "responses">): this {
        const subApp = cb instanceof Switchblade ? cb : cb(new Switchblade());

        subApp.config = this.getOriginalInstance().config;
        subApp.getOriginalInstance = () => this.getParentInstance();
        subApp.getParentInstance = () => this;

        path = path.trim();

        if (path === "/") {
            path = "";
        }

        if (path !== "" && !path.startsWith("/")) {
            path = `/${path}`;
        }

        if (path.endsWith("/")) {
            path = path.slice(0, -1);
        }

        for (const route of subApp.routes) {
            if (!route.validation) route.validation = {};

            if (options?.openapi) {
                const openAPI = Object.assign(route.openAPI || {}, options?.openapi);

                if (Object.keys(openAPI).length > 0) {
                    route.openAPI = openAPI;
                }
            }

            if (options?.cookies) {
                const cookies = Object.assign(route.validation?.cookies || {}, options.cookies);

                if (Object.keys(cookies).length > 0) {
                    route.validation.cookies = cookies;
                }
            }

            if (options?.headers) {
                const headers = Object.assign(route.validation?.headers || {}, options.headers);

                if (Object.keys(headers).length > 0) {
                    route.validation.headers = headers;
                }
            }

            if (options?.params) {
                const params = Object.assign(route.validation?.params || {}, options.params);

                if (Object.keys(params).length > 0) {
                    route.validation.params = params;
                }
            }

            if (options?.query) {
                const query = Object.assign(route.validation?.query || {}, options.query);

                if (Object.keys(query).length > 0) {
                    route.validation.query = query;
                }
            }

            if (options?.body) {
                const body = (route.validation?.body || {}) as SBRequestBodySchema;

                body.description = options.body.description || body.description;
                body.summary = options.body.summary || body.summary;
                body.required = options.body.required || body.required;
                body.content = Object.assign(body.content, options.body.content);

                if (Object.keys(body.content).length > 0) {
                    route.validation.body = body;
                }
            }

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
