import { createHonoAdapter } from "../src/adapters/hono";
import { Switchblade } from "../src/core/app";

import { serve } from "@hono/node-server";

const app = new Switchblade();

app.get("/", (req, res) => {
    return res.status(200).json({ message: "Hello, Switchblade!" });
});

const hono = createHonoAdapter(app);

serve(
    {
        fetch: hono.fetch,
        port: 3000,
    },
    () => console.log("Server running on http://localhost:3000")
);
