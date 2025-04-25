import type { Switchblade } from "..";

import { Hono } from "hono";

export function createHonoAdapter(app: Switchblade, honoApp: Hono = new Hono()) {
    for (const route of app.routes) {
        const fullPath = `${app.config?.basePath || ""}${route.path}`;

        honoApp.on(route.method, fullPath, async (c) => {
            return await route.run(c.req.raw, c.req.param());
        });
    }

    return honoApp;
}
