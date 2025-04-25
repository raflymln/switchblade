import type { Switchblade } from "..";

import { Hono } from "hono";

export function createHonoAdapter(app: Switchblade, honoApp: Hono = new Hono()) {
    for (const route of app.routes) {
        const { method, path, run } = route;
        const fullPath = `${app.config?.basePath || ""}${path}`;

        honoApp.on(method, fullPath, async (c) => {
            const res = await run(c.req.raw, c.req.param());

            if (res instanceof Response) {
                return res;
            }

            return c.notFound();
        });
    }

    return honoApp;
}
