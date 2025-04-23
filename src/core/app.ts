import type { ErrorHandler, RouteHandler, Middleware, RequestSchema, ResponseSchema, OpenAPIMetadata, ValidationOptions, RouteOptions } from "./types";
import type { OpenAPIV3_1 } from "openapi-types";

/**
 * Configuration options for Switchblade.
 */
export type Config = {
    basePath?: string;
    openapi?: OpenAPIV3_1.Document;
};

/**
 * Route registration data structure.
 * @internal
 */
type Route = {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";
    path: string;
    handler: RouteHandler;
    middlewares: Middleware[];
    validation?: ValidationOptions;
    openapi?: OpenAPIMetadata;
};

/**
 * Type for route methods (GET, POST, PUT, DELETE, PATCH, OPTIONS) inside the Switchblade class.
 * This is binded in .get, .post, .put, .delete, .patch, .options methods.
 */
type RouteMethod = <
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
    constructor(public config: Config = {}) {}

    routes: Route[] = [];
    errorHandlers: ErrorHandler[] = [];
    middlewares: Middleware[] = [];

    use(middleware: Middleware) {
        this.middlewares.push(middleware);
        return this;
    }

    onError(handler: ErrorHandler) {
        this.errorHandlers.push(handler);
        return this;
    }

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

    private define(method: Route["method"], path: string, handler: RouteHandler, options?: RouteOptions) {
        const route: Route = {
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
}
