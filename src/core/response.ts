import type { InferResponseSchema, ResponseSchema, DefaultResponsesType, CookieOptions } from "./types";

import { validate } from "./validation";

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

    send<StatusCode extends keyof Responses, ContentType extends keyof Responses[StatusCode]>(
        code: StatusCode,
        contentType: ContentType,
        data: InferResponseSchema<Responses[StatusCode][ContentType]>
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

    json<StatusCode extends keyof Responses>(code: StatusCode, data: InferResponseSchema<Responses[StatusCode] extends Record<"application/json", infer T> ? T : unknown>) {
        return this.send(code, "application/json" as keyof Responses[StatusCode], data as InferResponseSchema<Responses[StatusCode][keyof Responses[StatusCode]]>);
    }

    text<StatusCode extends keyof Responses>(code: StatusCode, data: InferResponseSchema<Responses[StatusCode] extends Record<"text/plain", infer T> ? T : unknown>) {
        return this.send(code, "text/plain" as keyof Responses[StatusCode], data as InferResponseSchema<Responses[StatusCode][keyof Responses[StatusCode]]>);
    }
}
