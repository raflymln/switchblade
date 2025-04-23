/* eslint-disable prefer-arrow-callback */
import { createHonoAdapter } from "../adapters/hono";
import { Switchblade } from "../core/app";

import { serve } from "@hono/node-server";
import t from "@sinclair/typebox";
import { z } from "zod";

const app = new Switchblade()
    .get(
        "/",
        (req, res) => {
            req.headers["x-authorization"];
            req.params.id;
            return res.send(200, "application/json", {
                appId: "123",
            });
        },
        {
            headers: {
                "x-authorization": z.string(),
            },
            params: {
                id: t.String(),
            },
            body: {
                name: z.string(),
                age: t.Number({
                    minimum: 0,
                    maximum: 100,
                }),
            },
            query: {
                search: z.string(),
                page: z.number().min(1),
            },
            cookies: {
                sessionId: z.string(),
            },
            responses: {
                200: {
                    "application/json": z.object({
                        appId: z.string(),
                    }),
                },
            },
        }
    )
    .use(function outside1() {
        console.log("Middleware Outside 1");
    })
    .get("/health", (req) => {
        req.headers["x-authorization"];
        req.params;
    })
    .group("/v1", (app) => {
        return app
            .use(function v1inside() {
                console.log("Middleware Group");
            })
            .get("/users", (req, res) => {
                req.params;
                res.send(200, "application/json", {
                    appId: "123",
                });
            })
            .put(
                "/users/:id",
                (req, res) => {
                    req.params?.id;
                    res.send(200, "application/json", {
                        appId: "123",
                    });
                },
                {
                    params: {
                        id: z.string().uuid(),
                    },
                    responses: {
                        200: {
                            "application/json": z.object({
                                appId: z.string(),
                            }),
                        },
                    },
                }
            );
    })
    .group("/v2", (app) => {
        return app.post("/users", (req, res) => {
            req.params;
            res.send(200, "application/json", {
                appId: "123",
            });
        });
    });

app.onError((error, req, res) => {
    console.error(error);
    res.json(500, { message: "Internal Server Error" });
});

console.log(app.routes);

const hono = createHonoAdapter(app);
serve(
    {
        fetch: hono.fetch,
        port: 3000,
    },
    () => {
        console.log("Server is running on http://localhost:3000");
    }
);
