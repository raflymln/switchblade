import type { AnyValidationSchema, InferValidationSchema } from "..";
import type { SerializeOptions } from "cookie";

import { validate } from "..";

import cookie from "cookie";

export type SBResponseSchema = Record<
    number,
    {
        description?: string;
        content: Record<string, AnyValidationSchema>;
        headers?: Record<string, AnyValidationSchema>;
    }
>;

export class SBResponse<
    Responses extends SBResponseSchema = SBResponseSchema,
    StatusCode extends keyof Responses & number = 200,
    ContentType extends keyof Responses[StatusCode]["content"] = "application/json",
> {
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
     * The current content type to return to client
     */
    contentType: string = "application/json";

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
    status<StatusCode extends keyof Responses & number>(code: StatusCode | (number & NonNullable<unknown>)): SBResponse<Responses, StatusCode, ContentType> {
        if (typeof code !== "number") {
            throw new Error("Status code must be a number");
        }

        this.statusCode = code;
        return this as never;
    }

    /**
     * Set a content type to the response
     *
     * @param contentType Content type
     * @param charset Charset
     */
    setContentType<ContentType extends keyof Responses[StatusCode]["content"] & string>(
        contentType: ContentType | (string & NonNullable<unknown>),
        charset: string = "utf-8"
    ): SBResponse<Responses, StatusCode, ContentType> {
        this.headers.set("Content-Type", `${contentType}; charset=${charset}`);
        return this as never;
    }

    /**
     * Set a header to the response
     *
     * @param key Header name
     * @param value Header value
     */
    setHeader<HeaderKey extends keyof Responses[StatusCode]["headers"] & string>(
        key: HeaderKey | (string & NonNullable<unknown>),
        value: InferValidationSchema<Responses[StatusCode]["headers"][HeaderKey] & string> | (string & NonNullable<unknown>)
    ): this {
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
        this.setHeader("Content-Type", this.contentType);

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
    send(data: InferValidationSchema<Responses[StatusCode]["content"][ContentType]>): Response {
        if (this.validationSchema?.[this.statusCode]) {
            const contentSchema = this.validationSchema[this.statusCode].content[this.contentType];

            if (contentSchema) {
                validate(contentSchema, data, ["SBResponse.body"]);
            }

            const headersSchema = this.validationSchema[this.statusCode].headers;

            if (headersSchema) {
                for (const [key, schema] of Object.entries(headersSchema)) {
                    const headerValue = this.headers.get(key);
                    this.setHeader(key, validate(schema, headerValue, [`SBResponse.headers.${key}`]));
                }
            }
        }

        // Prevent string being stringified twice, resulting in the string being escaped
        const parsedData = typeof data === "string" ? data : JSON.stringify(data);

        return this.createResponse(parsedData);
    }

    /**
     * Send a JSON response to the client, the content type will be set to "application/json"
     *
     * @param code Status code
     * @param data Response data following "application/json" schema
     */
    json(data: InferValidationSchema<Responses[StatusCode]["content"]["application/json"]>): Response {
        return this.setContentType("application/json").send(data as never);
    }

    /**
     * Send a text response to the client, the content type will be set to "text/plain"
     *
     * @param code Status code
     * @param data Response data following "text/plain" schema
     */
    text(data: InferValidationSchema<Responses[StatusCode]["content"]["text/plain"]>): Response {
        return this.setContentType("text/plain").send(data as never);
    }

    /**
     * Send a HTML response to the client, the content type will be set to "text/html"
     *
     * @param code Status code
     * @param data Response data following "text/html" schema
     */
    html(data: InferValidationSchema<Responses[StatusCode]["content"]["text/html"]>): Response {
        return this.setContentType("text/html").send(data as never);
    }
}
