import type { AnyValidationSchema, CookieOptions, InferValidationSchema } from "@/index";

import { validate } from "@/index";

type GetContentTypes<Responses extends DefaultResponsesType, StatusCode extends keyof Responses> = Responses[StatusCode] extends { content: infer C } ? C : never;
type GetContentTypeForType<Responses extends DefaultResponsesType, StatusCode extends keyof Responses, ContentType extends string> = Responses[StatusCode] extends {
    content: { [K in ContentType]: infer T };
}
    ? T
    : unknown;

/**
 * Default response type for the response object.
 * It's used for the response object.
 * The mapping is [status code] => configuration object.
 */
export type DefaultResponsesType = Record<
    number,
    {
        description?: string;
        summary?: string;
        content: Record<string, unknown>;
        headers?: Record<string, unknown>;
    }
>;

/**
 * Validation schema for the response object.
 * It's used for the response object.
 * The mapping is [status code] => configuration object.
 */
export type ResponseSchema = Record<
    number,
    {
        content: Record<string, AnyValidationSchema>;
        headers?: Record<string, AnyValidationSchema>;
    }
>;

export class SBResponse<Responses extends DefaultResponsesType = DefaultResponsesType> {
    constructor(public validationSchema?: ResponseSchema) {}

    statusCode: number = 200;
    headers: Headers = new Headers();
    response: Response | null = null;

    status(code: number) {
        this.statusCode = code;
        return this;
    }

    setHeader(key: string, value: string) {
        this.headers.set(key, value);
        return this;
    }

    setCookie(name: string, value: string, options?: CookieOptions) {
        const cookieOptions: string[] = [];

        if (options) {
            if (options.path) cookieOptions.push(`Path=${options.path}`);
            if (options.domain) cookieOptions.push(`Domain=${options.domain}`);
            if (options.expires) cookieOptions.push(`Expires=${options.expires.toUTCString()}`);
            if (options.maxAge) cookieOptions.push(`Max-Age=${options.maxAge}`);
            if (options.secure) cookieOptions.push("Secure");
            if (options.httpOnly) cookieOptions.push("HttpOnly");
            if (options.sameSite) cookieOptions.push(`SameSite=${options.sameSite === true ? "Lax" : options.sameSite}`);
            if (options.signed) cookieOptions.push("Signed");
        }

        this.headers.append("Set-Cookie", `${name}=${value}; ${cookieOptions.join("; ")}`);
        return this;
    }

    removeCookie(name: string, options?: CookieOptions) {
        const cookieOptions: string[] = [];

        if (options) {
            if (options.path) cookieOptions.push(`Path=${options.path}`);
            if (options.domain) cookieOptions.push(`Domain=${options.domain}`);
            if (options.expires) cookieOptions.push(`Expires=${options.expires.toUTCString()}`);
            if (options.maxAge) cookieOptions.push(`Max-Age=${options.maxAge}`);
            if (options.secure) cookieOptions.push("Secure");
            if (options.httpOnly) cookieOptions.push("HttpOnly");
            if (options.sameSite) cookieOptions.push(`SameSite=${options.sameSite === true ? "Lax" : options.sameSite}`);
        }

        this.headers.append("Set-Cookie", `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ${cookieOptions.join("; ")}`);
        return this;
    }

    redirect(statusCode: number = 302, url: string) {
        this.status(statusCode).setHeader("Location", url);

        this.response = new Response(null, {
            status: this.statusCode,
            headers: this.headers,
        });

        return this.response;
    }

    end(): Response {
        return new Response(null, {
            status: this.statusCode,
            headers: this.headers,
        });
    }

    send<StatusCode extends keyof Responses, ContentType extends keyof GetContentTypes<Responses, StatusCode>>(
        code: StatusCode,
        contentType: ContentType,
        data: InferValidationSchema<GetContentTypes<Responses, StatusCode>[ContentType]>
    ) {
        if (typeof code === "number") this.status(code);
        if (typeof contentType === "string") this.setHeader("Content-Type", contentType);

        if (this.validationSchema && code in this.validationSchema && contentType in this.validationSchema[code as number]) {
            const schema = this.validationSchema[code as number][contentType as keyof ResponseSchema[keyof ResponseSchema]];
            if (schema) validate(schema, data);
        }

        this.response = new Response(JSON.stringify(data), {
            status: this.statusCode,
            headers: this.headers,
        });

        return this.response;
    }

    json<StatusCode extends keyof Responses>(code: StatusCode, data: InferValidationSchema<GetContentTypeForType<Responses, StatusCode, "application/json">>) {
        return this.send(code, "application/json" as never, data as never);
    }

    text<StatusCode extends keyof Responses>(code: StatusCode, data: InferValidationSchema<GetContentTypeForType<Responses, StatusCode, "text/plain">>) {
        return this.send(code, "text/plain" as never, data as never);
    }
}
