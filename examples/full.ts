import { createHonoAdapter } from "../src/adapters/hono";
import { Switchblade } from "../src/core/app";

import { serve } from "@hono/node-server";
import { z } from "zod";

const app = new Switchblade({
    basePath: "/api/v1",
    openapi: {
        info: {
            title: "Switchblade Example API",
            version: "1.0.0",
            description: "A comprehensive example of Switchblade framework",
        },
        servers: [{ url: "http://localhost:3000", description: "Local development server" }],
    },
});

// Global Middleware for logging
app.use((req) => {
    console.log(`[${req.method}] ${req.url.pathname}`);
});

// User Management Routes
app.group("/users", (group) => {
    group.use((req) => {
        const token = req.headers["authorization"];
        if (!token) {
            throw new Error("No authorization token");
        }
        // Add your actual token validation logic here
    });

    group.get(
        "/",
        (req, res) => {
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
    );

    group.post(
        "/",
        (req, res) => {
            const { name, email } = req.body;
            return res.json(201, {
                id: Date.now(),
                name,
                email,
            });
        },
        {
            body: {
                name: z.string().min(2, "Name too short"),
                email: z.string().email("Invalid email format"),
            },
            responses: {
                201: {
                    "application/json": z.object({
                        id: z.number(),
                        name: z.string(),
                        email: z.string().email(),
                    }),
                },
            },
            openapi: {
                summary: "Create a new user",
                tags: ["Users"],
            },
        }
    );

    return group;
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
serve(
    {
        fetch: hono.fetch,
        port: 3000,
    },
    () => console.log("Server running on http://localhost:3000")
);
