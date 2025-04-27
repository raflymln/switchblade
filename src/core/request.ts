import type { AnyValidationSchema, InferValidationSchema, InferValidationSchemaInRecord, Switchblade } from "..";

import { validate } from "..";

import cookie from "cookie";

export type SBRequestParamSchema = Record<string, AnyValidationSchema>;
export type SBRequestBodySchema = {
    description?: string;
    summary?: string;
    required?: boolean;
    content: Record<string, AnyValidationSchema>;
};

export class SBRequest<
    Params extends SBRequestParamSchema = SBRequestParamSchema,
    Query extends SBRequestParamSchema = SBRequestParamSchema,
    Body extends SBRequestBodySchema = SBRequestBodySchema,
    Headers extends SBRequestParamSchema = SBRequestParamSchema,
    Cookies extends SBRequestParamSchema = SBRequestParamSchema,
> {
    private cacheMap: Map<string, unknown> = new Map();
    private cached(fn: () => unknown, key: string): unknown {
        if (this.cacheMap.has(key)) {
            return this.cacheMap.get(key);
        }

        const value = fn();
        this.cacheMap.set(key, value);

        return value;
    }

    constructor(
        /**
         * The main app instance
         */
        public app: Switchblade,
        /**
         * The original Request object
         */
        public raw: Request,
        /**
         * The original (unvalidated) request parameters
         */
        private _params: Record<string, unknown> = {},
        /**
         * The validation schema used in the request
         */
        public validationSchema?: {
            params?: SBRequestParamSchema;
            query?: SBRequestParamSchema;
            headers?: SBRequestParamSchema;
            body?: SBRequestBodySchema;
            cookies?: SBRequestParamSchema;
        }
    ) {}

    /**
     * Get the current running request state, this will be passed from the first middleware until the route handler itself
     * @example
     * ```ts
     *  const requestId = req.state.requestId;
     *
     *  if (!requestId) {
     *      req.state.requestId = crypto.randomUUID();
     *  }
     * ```
     */
    state: Record<string, unknown> = {};

    /**
     * The request parameters
     * @example req.params["id"]
     */
    get params(): InferValidationSchemaInRecord<Params> {
        return this.cached(() => {
            if (this.validationSchema?.params) {
                Object.entries(this.validationSchema.params).forEach(([key, schema]) => {
                    this._params[key] = validate(schema, this._params[key], [`SBRequest.params.${key}`]);
                });
            }

            return this._params;
        }, "params") as never;
    }

    /**
     * Get the request headers
     * @example req.headers["Content-Type"]
     */
    get headers(): InferValidationSchemaInRecord<Headers> {
        return this.cached(() => {
            const headers = Object.fromEntries(this.raw.headers.entries());

            if (this.validationSchema?.headers) {
                Object.entries(this.validationSchema.headers).forEach(([key, schema]) => {
                    headers[key] = validate(schema, headers[key], [`SBRequest.headers.${key}`]);
                });
            }

            return headers;
        }, "headers") as never;
    }

    /**
     * Get the request cookies
     * @example req.cookies["sessionId"]
     */
    get cookies(): InferValidationSchemaInRecord<Cookies> {
        return this.cached(() => {
            const cookies = cookie.parse(this.raw.headers.get("Cookie") || "");

            if (this.validationSchema?.cookies) {
                Object.entries(this.validationSchema.cookies).forEach(([key, schema]) => {
                    cookies[key] = validate(schema, cookies[key], [`SBRequest.cookies.${key}`]);
                });
            }

            return cookies;
        }, "cookies") as never;
    }

    /**
     * Get the request URL parameters
     * @example req.params["id"]
     */
    get query(): InferValidationSchemaInRecord<Query> {
        return this.cached(() => {
            const query: Record<string, string | string[]> = {};

            new URL(this.raw.url).searchParams.forEach((value, key) => {
                // Handle arrays (keys that appear multiple times)
                if (query[key]) {
                    if (Array.isArray(query[key])) {
                        query[key].push(value);
                    } else {
                        query[key] = [query[key], value];
                    }
                } else {
                    query[key] = value;
                }
            });

            // Multiple same query parameters will be parsed as an array
            if (this.validationSchema?.query) {
                Object.entries(this.validationSchema.query).forEach(([key, schema]) => {
                    query[key] = validate(schema, query[key], [`SBRequest.query.${key}`]);
                });
            }

            return query;
        }, "query") as never;
    }

    /**
     * Get current request method
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Request/method
     * @example GET
     */
    get method(): string {
        return this.raw.method;
    }

    /**
     * Get the request URL in URL object
     * @example req.url.href
     */
    get url(): URL {
        return new URL(this.raw.url);
    }

    /**
     * Get the content type of the request
     *
     * For content type of "multipart/form-data", it contains a boundary, for example it looks like this:
     * `Content-Type: multipart/form-data; boundary=---WebKitFormBoundary7MA4YWxkTrZu0gW ...`
     * So we only took the front part of the value which is "multipart/form-data` and ignore the rest
     *
     * @example `application/json`
     */
    get contentType(): string {
        return this.raw.headers.get("Content-Type")?.split(";")[0] || "";
    }

    /**
     * Parse the request body to JSON and validate it against the schema
     *
     * By default, it'd infer the type from request body "application/json" schema,
     * but you can specify a different content type by using `await req.json<"application/x-www-form-urlencoded">` in the generic type
     *
     * If the request body is not JSON (except for "application/x-www-form-urlencoded`), it will return an empty object
     *
     * @example const { email, name } = await req.json();
     */
    async json<ContentType extends keyof Body["content"] = "application/json">(): Promise<InferValidationSchema<Body["content"][ContentType]>> {
        const request = this.raw.clone();
        let data: Record<string, unknown>;

        switch (this.contentType) {
            case "application/json": {
                data = (await request.json()) as never;
                break;
            }

            case "application/x-www-form-urlencoded": {
                const params = new URLSearchParams(await request.text());
                const result: Record<string, unknown> = {};

                params.forEach((value, key) => {
                    // Handle arrays (keys that appear multiple times)
                    if (result[key]) {
                        if (Array.isArray(result[key])) {
                            result[key].push(value);
                        } else {
                            result[key] = [result[key], value];
                        }
                    } else {
                        result[key] = value;
                    }
                });

                data = result as never;
                break;
            }

            default: {
                try {
                    const text = await request.text();
                    data = JSON.parse(text) as never;
                } catch (error) {
                    return {} as never;
                }

                break;
            }
        }

        if (this.validationSchema?.body) {
            validate(this.validationSchema.body.content[this.contentType], data, ["SBRequest.body"]);
        }

        return data as never;
    }

    /**
     * Get the request body as text
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Body/text
     */
    async text(): Promise<string> {
        return this.raw.clone().text();
    }

    /**
     * Get the request body as form data
     * @see https://developer.mozilla.org/en-US/docs/Web/API/FormData
     */
    async formData(): Promise<FormData> {
        return this.raw.clone().formData();
    }

    /**
     * Get the request body as a stream
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Body/stream
     */
    async blob(): Promise<Blob> {
        return this.raw.clone().blob();
    }

    /**
     * Get the request body as an array buffer
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Body/arrayBuffer
     */
    async arrayBuffer(): Promise<ArrayBuffer> {
        return this.raw.clone().arrayBuffer();
    }
}
