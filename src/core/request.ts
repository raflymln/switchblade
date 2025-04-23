import type { DefaultRequestType, InferRequestSchema, RequestSchema } from "./types";

import { validate } from "./validation";

export class SBRequest<Params = DefaultRequestType, Query = DefaultRequestType, Body = DefaultRequestType, Headers = DefaultRequestType, Cookies = DefaultRequestType> {
    constructor(
        public raw: Request,
        private bodyText: string,
        public params: InferRequestSchema<Params> = {} as InferRequestSchema<Params>,
        public validationSchema?: {
            params?: RequestSchema;
            query?: RequestSchema;
            headers?: RequestSchema;
            body?: RequestSchema;
            cookies?: RequestSchema;
        }
    ) {}

    state: Record<string, unknown> = {};

    get method() {
        return this.raw.method;
    }

    get url() {
        return new URL(this.raw.url);
    }

    get contentType() {
        return this.raw.headers.get("Content-Type") || "";
    }

    get headers() {
        const headers = Object.fromEntries(this.raw.headers.entries());

        if (this.validationSchema?.headers) {
            for (const [key, schema] of Object.entries(this.validationSchema.headers)) {
                if (schema) {
                    headers[key] = validate(schema, headers[key]);
                }
            }
        }

        return headers as InferRequestSchema<Headers>;
    }

    get cookies() {
        const cookies = this.raw.headers.get("Cookie") || "";
        const cookieObj: Record<string, string> = {};

        for (const cookie of cookies.split("; ")) {
            const [key, value] = cookie.split("=");
            cookieObj[key] = decodeURIComponent(value);
        }

        if (this.validationSchema?.cookies) {
            for (const [key, schema] of Object.entries(this.validationSchema.cookies)) {
                if (schema) {
                    cookieObj[key] = validate(schema, cookieObj[key]);
                }
            }
        }

        return cookieObj as InferRequestSchema<Cookies>;
    }

    get query() {
        const url = new URL(this.raw.url);
        const query: Record<string, string> = {};

        for (const [key, value] of url.searchParams.entries()) {
            query[key] = value;
        }

        if (this.validationSchema?.query) {
            for (const [key, schema] of Object.entries(this.validationSchema.query)) {
                if (schema) {
                    query[key] = validate(schema, query[key]);
                }
            }
        }

        return query as Query;
    }

    get body(): InferRequestSchema<Body> {
        if (this.contentType.includes("application/json")) {
            const data = JSON.parse(this.bodyText);

            if (this.validationSchema?.body) {
                for (const [key, schema] of Object.entries(this.validationSchema.body)) {
                    if (schema) {
                        data[key] = validate(schema, data[key]);
                    }
                }
            }

            return data;
        } else if (this.contentType.includes("application/x-www-form-urlencoded")) {
            const formData = new URLSearchParams(this.bodyText);
            const parsedBody: Record<string, string> = {};

            for (const [key, value] of formData.entries()) {
                parsedBody[key] = value;
            }

            if (this.validationSchema?.body) {
                for (const [key, schema] of Object.entries(this.validationSchema.body)) {
                    if (schema) {
                        parsedBody[key] = validate(schema, parsedBody[key]);
                    }
                }
            }

            return parsedBody as InferRequestSchema<Body>;
        }

        return this.bodyText as InferRequestSchema<Body>;
    }
}
