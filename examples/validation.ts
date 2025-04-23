import { createHonoAdapter } from "../src/adapters/hono";
import { Switchblade } from "../src/core/app";

import { serve } from "@hono/node-server";
import { Type } from "@sinclair/typebox";
import { z } from "zod";

const app = new Switchblade();

// Zod Validation
app.post(
    "/users",
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
    }
);

// TypeBox Validation
app.post(
    "/products",
    (req, res) => {
        const { name, price } = req.body;
        return res.json(201, {
            id: Date.now(),
            name,
            price,
        });
    },
    {
        body: {
            name: Type.String({ minLength: 2 }),
            price: Type.Number({ minimum: 0 }),
        },
    }
);

const hono = createHonoAdapter(app);
serve(
    {
        fetch: hono.fetch,
        port: 3000,
    },
    () => console.log("Server running on http://localhost:3000")
);
