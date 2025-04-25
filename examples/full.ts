import { Switchblade } from "../src";
import { createHonoAdapter } from "../src/adapters/hono";

import { serve } from "@hono/node-server";
import { Scalar } from "@scalar/hono-api-reference";
import { Type } from "@sinclair/typebox";
import { z } from "zod";
import { extendZodWithOpenApi } from "zod-openapi";

extendZodWithOpenApi(z);

const app = new Switchblade({
    basePath: "/api/v1",
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
});

// Global Middleware for logging
app.use((req) => {
    console.log(`[${req.method}] ${req.url.pathname}`);
});

// User Management Routes
app.group("/users", (group) => {
    return group
        .use((req) => {
            const token = req.headers["authorization"];
            if (!token) {
                throw new Error("No authorization token");
            }
            // Add your actual token validation logic here
        })
        .get(
            "/",
            (req, res) => {
                req.params;
                return res.json(200, {
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
        .post(
            "/",
            (req, res) => {
                const { name, email } = req.body;

                res.send(201, "application/json", {
                    id: Date.now(),
                    name,
                    email,
                });

                return res.json(201, {
                    id: Date.now(),
                    name,
                    email,
                });
            },
            {
                body: {
                    name: z.string().min(2, "Name too short").openapi({
                        description: "The name of the user",
                        example: "John Doe",
                    }),
                    email: Type.String({
                        format: "email",
                        description: "The email of the user",
                        example: "johndoe@gmail.com",
                    }),
                },
                query: {
                    page: z.number().optional().default(1).openapi({
                        description: "The page number for pagination",
                        example: 1,
                    }),
                },
                headers: {
                    Authorization: z.string().openapi({
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
                    id: z.number().openapi({
                        description: "The ID of the user",
                        example: 123,
                    }),
                },
                responses: {
                    201: {
                        headers: {
                            Location: z.string(),
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
                        },
                    },
                },
                openapi: {
                    summary: "Create a new user",
                    tags: ["Users"],
                },
            }
        );
});

app.get("/openapi", (req, res) => {
    const openapiDoc = app.getOpenAPI31Document();
    return res.json(200, openapiDoc);
});

// Global Error Handler
app.onError((error, req, res) => {
    console.error(error);

    if (error instanceof Error && error.name === "SBValidationError") {
        return res.json(400, {
            message: "Validation Error",
            details: error.message,
        });
    }

    return res.json(500, {
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : error) : "Something went wrong",
    });
});

const hono = createHonoAdapter(app);

hono.get("/scalar", Scalar({ url: "/api/v1/openapi" }));

serve(
    {
        fetch: hono.fetch,
        port: 3000,
    },
    () => console.log("Server running on http://localhost:3000")
);
