import type { AnyValidationSchema, InferValidationSchema } from "..";
import type { SerializeOptions } from "cookie";

import { validate } from "..";

import cookie from "cookie";

type GetSchema<Responses extends SBResponseSchema, StatusCode extends keyof Responses> = Responses[StatusCode] extends {
    content: infer C;
}
    ? C
    : never;

type GetSchemaForType<Responses extends SBResponseSchema, StatusCode extends keyof Responses, ContentType extends string> = Responses[StatusCode] extends {
    content: { [K in ContentType]: infer T };
}
    ? T
    : unknown;

export type SBResponseSchema = Record<
    number,
    {
        description?: string;
        content: Record<string, AnyValidationSchema>;
        headers?: Record<string, AnyValidationSchema>;
    }
>;

export class SBResponse<Responses extends SBResponseSchema = SBResponseSchema> {
    constructor(
        /**
         * The validation schema used in the request
         */
        public validationSchema?: SBResponseSchema
    ) {}

    /**
     * The current status code to return to client
     */
    statusCode: number = 200;

    /**
     * The current headers to return to client
     */
    headers: Headers = new Headers();

    /**
     * The current response object
     */
    response: Response | null = null;

    /**
     * The current cookie list to be set on client
     */
    get cookies(): Record<string, string | undefined> {
        return cookie.parse(this.headers.get("Set-Cookie") || "");
    }

    /**
     * Set status code of the response
     *
     * @param code Status code
     */
    status(code: number): this {
        this.statusCode = code;
        return this;
    }

    /**
     * Set a header to the response
     *
     * @param key Header name
     * @param value Header value
     */
    setHeader(key: string, value: string): this {
        this.headers.set(key, value);
        return this;
    }

    /**
     * Set a cookie to the response
     *
     * @param name Cookie Name
     * @param value Cookie Value
     * @param options Cookie Options
     */
    setCookie(name: string, value: string, options?: SerializeOptions): this {
        this.headers.append("Set-Cookie", cookie.serialize(name, value, options));
        return this;
    }

    /**
     * Delete a cookie on client, it doesn't remove the cookie set
     * from `setCookie` method, it just sets the cookie to expire on client
     *
     * @param name Cookie Name
     * @param options Cookie Options to match
     */
    removeCookie(name: string, options?: Pick<SerializeOptions, "path" | "secure" | "domain">): this {
        this.headers.append(
            "Set-Cookie",
            cookie.serialize(name, "", {
                expires: new Date(0),
                ...options,
            })
        );

        return this;
    }

    /**
     * Send a raw response to the client (it's actually just a simple new Response function)
     * This is not typed, use this for low-level response
     *
     * @param body Body Init
     * @param init Response Init
     */
    createResponse(body?: RequestInit["body"], init?: ResponseInit): Response {
        this.response = new Response(body, {
            status: this.statusCode,
            headers: this.headers,
            ...init,
        });

        return this.response;
    }

    /**
     * Redirect the client to a new URL
     *
     * @param statusCode Status code
     * @param url URL to redirect to
     */
    redirect(statusCode: number = 302, url: string): Response {
        return this.status(statusCode).setHeader("Location", url).createResponse();
    }

    /**
     * End the response without any body
     */
    end(): Response {
        return this.createResponse();
    }

    /**
     * Send a typed response to the client, this will follow the validation schema provided
     *
     * @param code Status code
     * @param contentType Content type
     * @param data Typed response data
     */
    send<StatusCode extends keyof Responses, ContentType extends keyof GetSchema<Responses, StatusCode>>(
        code: StatusCode,
        contentType: ContentType,
        data: InferValidationSchema<GetSchema<Responses, StatusCode>[ContentType]>
    ): Response {
        if (typeof code !== "number") {
            throw new Error("Status code must be a number");
        }

        if (typeof contentType !== "string") {
            throw new Error("Content type must be a string");
        }

        if (this.validationSchema?.[code]) {
            const contentSchema = this.validationSchema[code].content[contentType];

            if (contentSchema) {
                validate(contentSchema, data);
            }

            const headersSchema = this.validationSchema[code].headers;

            if (headersSchema) {
                for (const [key, schema] of Object.entries(headersSchema)) {
                    const headerValue = this.headers.get(key);
                    this.setHeader(key, validate(schema, headerValue));
                }
            }
        }

        return this.status(code).setHeader("Content-Type", contentType).createResponse(JSON.stringify(data));
    }

    /**
     * Send a JSON response to the client, the content type will be set to "application/json"
     *
     * @param code Status code
     * @param data Response data following "application/json" schema
     */
    json<StatusCode extends keyof Responses>(code: StatusCode, data: InferValidationSchema<GetSchemaForType<Responses, StatusCode, "application/json">>): Response {
        return this.send(code, "application/json" as never, data as never);
    }

    /**
     * Send a text response to the client, the content type will be set to "text/plain"
     *
     * @param code Status code
     * @param data Response data following "text/plain" schema
     */
    text<StatusCode extends keyof Responses>(code: StatusCode, data: InferValidationSchema<GetSchemaForType<Responses, StatusCode, "text/plain">>): Response {
        return this.send(code, "text/plain" as never, data as never);
    }

    /**
     * Send a HTML response to the client, the content type will be set to "text/html"
     *
     * @param code Status code
     * @param data Response data following "text/html" schema
     */
    html<StatusCode extends keyof Responses>(code: StatusCode, data: InferValidationSchema<GetSchemaForType<Responses, StatusCode, "text/html">>): Response {
        return this.send(code, "text/html" as never, data as never);
    }
}
