# Middleware

Middleware in Switchblade provides a powerful way to intercept and modify requests and responses across your application. They can:

- Modify request or response
- Execute additional code
- End the request-response cycle

Middleware is applied in the chained order of the routes.

::: tip
Middleware also have it's own options (validation & openapi, except responses validation) like a route, which then will be passed to the registered route below it.
:::

## Usage

::: warning
Be careful, avoid this mistake:

1. If the route handler is async function, MAKE SURE to use `await next()` instead of `next()`.
2. Make sure to call `next()` at the end of your middleware function. If not the request will be ended, unless you want it that way.

:::

```typescript
import { Switchblade } from "@takodotid/switchblade";

const app = new Switchblade()
    // Global middleware since it's defined first before any route
    .use(
        (req, res, next) => {
            console.log(`Incoming ${req.method} request to ${req.url}`);
            // You can modify request or set additional properties
            req.state.requestTime = Date.now();
            next();
        },
        {
            openapi: {
                // This tags will be passed to /users and /users/:id below
                tags: ["Global"],
            },
            headers: {
                // This `authorization` header will also be passed to /users and /users/:id below
                authorization: z.string().optional(),
            },
        }
    )
    .get(
        "/users",
        (req, res) => {
            return res.json({ users: [] });
        },
        {
            openapi: {
                // This will override the `Global` tags above
                tags: ["Users"],
            },
        }
    )
    .group("/users/:id", (app) => {
        return (
            app
                // This middleware will be applied to all routes in this group
                .use(async (req, res, next) => {
                    let isRatelimited = getRateLimit(req);

                    if (isRatelimited) {
                        return res.status(429).json({ error: "Rate limit exceeded" });
                    }

                    console.log(`User ID: ${req.params.id}`);
                    await next();
                })
                .get("/", (req, res) => {
                    return res.json({ userId: req.params.id });
                })
        );
    });
```

## Execution Order

Just like Hono, unlike Elysia, the `next()` function is actually a function to call the next middleware/route handler, so you can use like `AsyncLocalStorage` or decide whether to call the next middleware or not. See the following example:

```typescript
new Switchblade()
    .use(async (req, res, next) => {
        console.log("Middleware 1 Start");
        asyncLocalStorage.run(requestCtx, () => {
            await next();
        });
        console.log("Middleware 1 End");
    })
    .use(async (req, res, next) => {
        console.log("Middleware 2 Start");
        await next();
        console.log("Middleware 2 End");
    })
    .use(async (req, res, next) => {
        console.log("Middleware 3 Start");
        await next();
        console.log("Middleware 3 End");
    })
    .get("/", (req, res) => {
        const requestCtx = asyncLocalStorage.getStore();
        console.log(`Hello world!`);
        return res.setHeader("X-Request-ID", requestCtx.requestId).text("Hello!");
    });
```

This will result in the following output:

```
Middleware 1 Start
    Middleware 2 Start
        Middleware 3 Start
            Hello world!
        Middleware 3 End
    Middleware 2 End
Middleware 1 End
```

## Middleware State

Middleware can add data to the request state:

```typescript
app.use((req, res) => {
    // Add custom properties to request
    req.state.requestId = generateUniqueId();
});

app.get("/users", (req, res) => {
    // Access middleware-added state
    console.log(req.state.requestId);
});
```
