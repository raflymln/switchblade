import type { Switchblade } from "@/core/app";

import { Hono } from "hono";

import { SBRequest } from "@/core/request";
import { SBResponse } from "@/core/response";

export function createHonoAdapter(app: Switchblade, honoApp: Hono = new Hono()) {
    for (const route of app.routes) {
        const { method, path, handler, middlewares, validation } = route;
        const fullPath = `${app.config?.basePath || ""}${path}`;

        honoApp[method.toLowerCase() as Lowercase<typeof method>](fullPath, async (c) => {
            const bodyText = await c.req.text();

            const sbReq = new SBRequest(c.req.raw, bodyText, c.req.param(), {
                query: validation?.query,
                params: validation?.params,
                headers: validation?.headers,
                body: validation?.body,
            });

            const sbRes = new SBResponse(validation?.responses);

            try {
                for (const middleware of middlewares) {
                    await middleware(sbReq, sbRes);
                }

                await handler(sbReq, sbRes);

                if (sbRes.response instanceof Response) {
                    return sbRes.response;
                }

                return sbRes.end();
            } catch (error) {
                for (const errorHandler of app.errorHandlers) {
                    await errorHandler(error, sbReq, sbRes);
                }
            }
        });
    }

    return honoApp;
}
