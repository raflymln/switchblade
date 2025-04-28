# Adapters

Adapters are middleware that transform Switchblade's core routing and request handling into framework-specific implementations. This allows you to switch between different backend frameworks with minimal code changes.

## Supported Adapters

- [x] [Hono](https://hono.dev)

Please go to respective adapter documentation for more details on how to use them.

## Using the Adapter

::: code-group

```typescript [Hono]
import { Switchblade } from "@takodotid/switchblade";
import { createHonoAdapter } from "@takodotid/switchblade/adapters/hono";
import { serve } from "@hono/node-server";

// Create Switchblade app
const app = new Switchblade();

// Define routes as usual
app.get("/", (req, res) => {
    return res.json({ message: "Hello, Switchblade!" });
});

// Convert Switchblade app to Hono app
const hono = createHonoAdapter(app);

// Start the server using Hono's Node server
serve(
    {
        fetch: hono.fetch,
        port: 3000,
    },
    () => console.log("Server running on http://localhost:3000")
);
```

:::

## Creating Custom Adapters

You can create a custom adapter by implementing the adapter interface:

```typescript
function createCustomAdapter(app: Switchblade) {
    // Implementation depends on target framework
    const customFrameworkApp = createCustomFrameworkApp();

    // Iterate through Switchblade routes
    for (const route of app.routes) {
        const fullPath = `${app.config?.basePath || ""}${route.path}`;

        customFrameworkApp.on(route.method, fullPath, async (req) => {
            const rawRequest = req.raw; // Get the raw request object, must be Web Standard Response object
            const params = req.param(); // Get the parameters from the request

            return await route.run(rawRequest, params);
        });
    }

    return customFrameworkApp;
}
```
