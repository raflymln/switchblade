<script setup>
import { VPFeatures } from 'vitepress/theme'

const features = [
    {
        icon: '🛡️',
        title: 'Validation-First',
        details: 'Always validate incoming/outgoing data to ensure data integrity and security, it\'s cover all aspects of the API from query, body, headers, until responses.',
    },
    {
        icon: '📄',
        title: 'OpenAPI-Driven',
        details: 'Automatically generate OpenAPI documentation from your code, ensuring that your API is always up-to-date and well-documented.',
    },
    {
        icon: '🔀',
        title: 'Adapter-Friendly',
        details: 'Easily switch between different backend frameworks without changing your core logic. This allows you to choose the best tool for the job without being locked into a single framework.',
    },
    {
        icon: '🚀',
        title: 'Developer Experience',
        details: 'While making this framework, we do a lot of research and try-out various libraries to find the best DX and put it into Switchblade. Want to make backend on RoR-like controller? or just a simple function? Switchblade has you covered.',
    },
    {
        icon: '⚡',
        title: 'Feature-Rich',
        details: 'Switchblade is designed to be feature-rich, providing everything you need to build robust APIs out of the box. This includes input validation, OpenAPI generation, and more.',
    },
    {
        icon: '🧩',
        title: 'Modular Architecture',
        details: 'Switchblade is designed to be modular, allowing you to pick and choose the features you need for your project. This makes it easy to customize and extend the framework to fit your specific needs.',
    },
]
</script>

# What is Switchblade?

Switchblade is Javascript **backend abstraction layer** to allow developers to create APIs equpped with various features and also make it easy to switch between different backend frameworks like Hono, Express, and Fastify.

---

### The core philosophy of Switchblade:

<VPFeatures id="introduction-features" :features />

## Key Features

- 🛡️ Comprehensive input validation
- 🔀 Adapter-based architecture
- 📄 Automatic OpenAPI generation
- 🚀 TypeScript-first design

## Supported Validation Libraries

- [x] Zod
- [x] TypeBox
- [ ] Valibot (Coming Soon)

Got a better validation library? Open an issue or PR on [GitHub](https://github.com/takodotid/switchblade/issues)

## Supported Adapters

- [x] Hono
- [ ] Express (Coming Soon)
- [ ] Fastify (Coming Soon)

Got a better adapter? Open an issue or PR on [GitHub](https://github.com/takodotid/switchblade/issues)

## Quick Example

```typescript
import { Switchblade } from "@takodotid/switchblade";
import { createHonoAdapter } from "@takodotid/switchblade/adapters/hono";
import { z } from "zod";
import { serve } from "@hono/node-server";

const app = new Switchblade();

app.post(
    "/users",
    (req, res) => {
        const { name, email } = req.body;

        return res.status(200).json({
            id: crypto.randomUUID(),
            name,
            email,
        });
    },
    {
        body: {
            content: {
                "application/json": z.object({
                    name: z.string(),
                    email: z.string().email(),
                }),
            },
        },
        response: {
            200: {
                content: {
                    "application/json": z.object({
                        id: z.number(),
                        name: z.string(),
                        email: z.string().email(),
                    }),
                },
            },
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
```
