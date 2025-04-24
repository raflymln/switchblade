# Adapters

Switchblade's adapter system allows you to seamlessly integrate with different backend frameworks while maintaining a consistent API.

## What are Adapters?

Adapters are middleware that transform Switchblade's core routing and request handling into framework-specific implementations. This allows you to switch between different backend frameworks with minimal code changes.

## Supported Adapters

- [x] Hono
- [ ] Express (Coming Soon)
- [ ] Fastify (Coming Soon)

## Using the Hono Adapter

### Basic Usage

```typescript
import { Switchblade } from "@takodotid/switchblade";
import { createHonoAdapter } from "@takodotid/switchblade/adapters/hono";
import { serve } from "@hono/node-server";

// Create Switchblade app
const app = new Switchblade();

// Define routes as usual
app.get("/", (req, res) => {
    return res.json(200, { message: "Hello, Switchblade!" });
});

// Create Hono adapter
const hono = createHonoAdapter(app);

// Start the server
serve({ fetch: hono.fetch, port: 3000 }, () => console.log("Server running on http://localhost:3000"));
```

## Creating Custom Adapters

You can create a custom adapter by implementing the adapter interface:

```typescript
function createCustomAdapter(app: Switchblade) {
    // Implementation depends on target framework
    const customFrameworkApp = createCustomFrameworkApp();

    // Iterate through Switchblade routes
    for (const route of app.routes) {
        const { method, path, handler, middlewares } = route;

        // Map Switchblade routes to custom framework
        customFrameworkApp[method.toLowerCase()](path, async (req, res) => {
            // Convert framework-specific request/response
            // to Switchblade SBRequest and SBResponse
            const sbReq = convertToSBRequest(req);
            const sbRes = new SBResponse();

            try {
                // Run middlewares
                for (const middleware of middlewares) {
                    await middleware(sbReq, sbRes);
                }

                // Execute route handler
                await handler(sbReq, sbRes);

                // Convert response back to framework-specific response
                // Switchblade always returns a Web Standard Response object
                if (sbRes.response instanceof Response) {
                    return sbRes.response;
                }

                return sbRes.end(); // Equivalent to new Response(null, { status: 204 });
            } catch (error) {
                for (const errorHandler of app.errorHandlers) {
                    await errorHandler(error, sbReq, sbRes);
                }
            }
        });
    }

    return customFrameworkApp;
}
```
