/**
 * Cookie available options.
 */
export type CookieOptions = {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None" | boolean;
    path?: string;
    domain?: string;
    expires?: Date;
    signed?: boolean;
};
