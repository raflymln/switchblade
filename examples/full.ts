import { Switchblade } from "../src";
import { createHonoAdapter } from "../src/adapters/hono";

import { serve } from "@hono/node-server";
import { Scalar } from "@scalar/hono-api-reference";
import { Type } from "@sinclair/typebox";
import { AssertError } from "@sinclair/typebox/value";
import { z, ZodError } from "zod";
import { extendZodWithOpenApi } from "zod-openapi";

import assert from "node:assert";
import { describe, it } from "node:test";

extendZodWithOpenApi(z);

const userRoutes = new Switchblade()
    .use(async (req, res, next) => {
        // Always use lower case for headers
        const token = req.headers.authorization;

        if (!token) {
            throw new Error("No authorization token");
        }

        await next();
    })
    .get(
        "/",
        (req, res) => {
            return res.status(200).json({
                users: [
                    { id: 1, name: "John Doe" },
                    { id: 2, name: "Jane Smith" },
                ],
            });
        },
        {
            openapi: {
                summary: "List all users",
                tags: ["Users"],
            },
        }
    )
    .patch(
        "/:id",
        async (req, res) => {
            const { name, email } = await req.json();

            return res //
                .status(201)
                .setHeader("x-powered-by", "Switchblade")
                .json({
                    id: Date.now(),
                    name,
                    email,
                });
        },
        {
            body: {
                content: {
                    "application/json": z.object({
                        name: z.string().min(2, "Name too short").openapi({
                            description: "The name of the user",
                            example: "John Doe",
                        }),
                        email: z.string().email().openapi({
                            description: "The email of the user",
                            example: "user@mail.com",
                        }),
                    }),
                },
            },
            query: {
                page: z
                    .string()
                    .refine((v) => !isNaN(Number(v)), {
                        message: "ID must be a number",
                    })
                    .openapi({
                        description: "The page number for pagination",
                        example: "1",
                    }),
            },
            headers: {
                // Always use lower case for headers
                authorization: z.string().openapi({
                    description: "Bearer token for authorization",
                    example: "Bearer abcdef123456",
                }),
            },
            cookies: {
                sessionId: z.string().optional().openapi({
                    description: "Session ID for the user",
                    example: "abcdef123456",
                }),
            },
            params: {
                id: z
                    .string()
                    .refine((v) => !isNaN(Number(v)), {
                        message: "ID must be a number",
                    })
                    .openapi({
                        description: "The ID of the user",
                        example: "123",
                    }),
            },
            responses: {
                201: {
                    headers: {
                        // Always use lower case for headers
                        "x-powered-by": z.string().openapi({
                            description: "Powered by Switchblade",
                            example: "Switchblade",
                        }),
                    },
                    links: {
                        User: {
                            operationId: "getUser",
                            parameters: {
                                id: z.number(),
                            },
                        },
                    },
                    content: {
                        "application/json": z.object({
                            id: z.number().openapi({
                                description: "The ID of the created user",
                                example: 123,
                            }),
                            name: z.string(),
                            email: z.string().email(),
                        }),
                        "application/xml": Type.Object({
                            id: Type.Number(),
                            name: Type.String(),
                            email: Type.String(),
                        }),
                    },
                },
                400: {
                    content: {},
                },
            },
            openapi: {
                summary: "Update a user",
                tags: ["Users"],
            },
        }
    );

const mainApp = new Switchblade({
    // All routes below will be prefixed with this path
    basePath: "/api/v1",
    // OpenAPI configuration
    openapi: {
        openapi: "3.1.0",
        info: {
            title: "Switchblade Example API",
            version: "1.0.0",
            description: "A comprehensive example of Switchblade framework",
        },
        servers: [{ url: "http://localhost:3000", description: "Local development server" }],
        components: {},
    },
})
    // Middleware bind to all routes below
    .use(async (req, res, next) => {
        console.log(`[${req.method}] ${req.url.pathname}`);
        await next(); // Always `await` it
    })
    // Error handler bind to the chained routes & middleware below
    .onError((error, req, res) => {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
            return res.status(400).json(error);
        }

        // Handle Typebox validation errors
        if (error instanceof AssertError) {
            return res.status(400).json({
                message: "Validation Error",
                details: error.error,
            });
        }

        if (error instanceof Error && error.message === "No authorization token") {
            return res.status(401).json({
                message: "Unauthorized",
                details: error.message,
            });
        }

        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "Zod Validation Error",
                details: error.errors,
            });
        }

        // By default if you don't handle the error, it will return a 500 "Internal Server Error"
        console.error(error);
    })
    // User Management Routes
    .group("/users", userRoutes)
    // OpenAPI Document
    .get("/openapi.json", (req, res) => {
        const openapiDoc = req.app.getOpenAPI3_1Document();
        return res.status(200).json(openapiDoc);
    })
    .use(async (req, res, next) => {
        console.log("middleware 1 start");
        await next();
        console.log("middleware 1 end");
    })
    .use(async (req, res, next) => {
        console.log("   middleware 2 start");
        await next();
        console.log("   middleware 2 end");
    })
    .use(async (req, res, next) => {
        console.log("       middleware 3 start");
        await next();
        console.log("       middleware 3 end");
    })
    .get(
        "/hello/:name",
        async (req, res) => {
            const name = decodeURIComponent(req.params.name);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (name.length > 10) {
                if (req.contentType === "text/plain") {
                    return res.status(400).setContentType("text/plain").send("Name too long");
                }

                return res.status(400).setContentType("application/json").send({
                    message: "Name too long",
                    details: "Name must be less than 10 characters",
                });
            }

            console.log(`           Hello ${name}!`);
            return res.status(200).text(`Hello ${name}!`);
        },
        {
            params: {
                name: z.string().openapi({
                    description: "The name of the user",
                    example: "John Doe",
                }),
            },
            responses: {
                200: {
                    content: {
                        "text/plain": z.string().openapi({
                            description: "The greeting message",
                            example: "Hello John Doe!",
                        }),
                    },
                },
                400: {
                    content: {
                        "application/json": z.object({
                            message: z.string(),
                            details: z.string(),
                        }),
                        "text/plain": z.string().openapi({
                            description: "The error message",
                            example: "Name too long",
                        }),
                    },
                },
            },
        }
    );

// Example of a test case using "node:test"
describe("Switchblade Example API", async () => {
    await it("GET /users", async () => {
        const route = mainApp.getRoute("GET", "/hello/:name");
        if (!route) throw new Error("Route not found");

        const name = "John Doe";
        const response = await route.run(new Request("http://localhost:3000", { method: "GET" }), {
            name: encodeURIComponent(name),
        });

        assert.strictEqual(response.status, 200);
        assert.strictEqual(await response.text(), `Hello ${name}!`);
    });
});

// Bind the app to Hono, you can pass your available hono instance as the second argument
// You can use any other adapter, or you can create your own adapter
const hono = createHonoAdapter(mainApp /* , honoApp */);

// Display the OpenAPI Swagger UI using compatible library
// Bind the OpenAPI document url to the registered `/api/v1/openapi.json` path
hono.get(
    "/scalar",
    Scalar({
        url: "/api/v1/openapi.json",
        theme: "mars",
    })
);

// Serve the app using Hono selected adapter
serve(
    {
        fetch: hono.fetch,
        port: 3000,
    },
    () => console.log("Server running on http://localhost:3000")
);
