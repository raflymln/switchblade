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

            // Run middlewares
            for (const middleware of middlewares) {
                await middleware(sbReq, sbRes);
            }

            // Execute route handler
            await handler(sbReq, sbRes);

            // Convert response back to framework-specific response
            return convertFromSBResponse(sbRes);
        });
    }

    return customFrameworkApp;
}
```

## Adapter Lifecycle

1. Switchblade creates route definitions
2. Adapter translates routes to target framework
3. Middlewares are applied
4. Route handlers are executed
5. Responses are converted and returned

## Best Practices

- Keep route logic framework-agnostic
- Use Switchblade's request and response objects
- Avoid framework-specific code in route handlers
- Handle type conversions in the adapter

## Limitations

- Some framework-specific features may not be directly translatable
- Performance overhead of abstraction
- Complex middlewares might require custom handling

## Troubleshooting

### Common Issues

- **Routing Conflicts**: Ensure no route path overlaps
- **Middleware Compatibility**: Some middlewares may need adaptation
- **Type Conversion**: Carefully handle request/response conversions

## Future Roadmap

- More framework adapters
- Improved middleware compatibility
- Performance optimizations

## Community and Support

- [GitHub Issues](https://github.com/takodotid/switchblade/issues)
- [Discord Community](https://discord.gg/your-discord-link)
