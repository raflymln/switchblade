# Middleware

Middleware in Switchblade provides a powerful way to intercept and modify requests and responses across your application. They can:

- Modify request or response
- Execute additional code
- End the request-response cycle

::: danger
Middleware does **NOT** stop the request-response cycle by default. If you want to stop the request, you need to **THROW an ERROR**. Handle it using `app.onError` to catch and respond to the error.
:::

Middleware is applied in the chained order of the routes, see the [Advanced Routing](routing.md#middleware-advanced-routing) section for more details.

## Basic Middleware

```typescript
import { Switchblade } from "@takodotid/switchblade";

const app = new Switchblade();

// Global middleware
app.use((req, res) => {
    console.log(`Incoming ${req.method} request to ${req.url}`);
    // You can modify request or set additional properties
    req.state.requestTime = Date.now();
});

// Route-specific middleware
app.get(
    "/users",
    // Middleware before route handler
    (req, res) => {
        // Check authentication
        if (!req.headers["authorization"]) {
            return res.json(401, { error: "Unauthorized" });
        }
    },
    // Route handler
    (req, res) => {
        return res.json(200, { users: [] });
    }
);
```

## Error Handling in Middleware

```typescript
const app = new Switchblade()
    .onError((error, req, res) => {
        if (error instanceof SomeSpecificError) {
            return res.json(400, { error: "Specific error message" });
        }

        return res.json(500, { error: "Internal server error" });
    })
    .use((req, res) => {
        if (!req.headers.authorization) {
            throw new SomeSpecificError("Unauthorized");
        }

        // Continue processing
    });
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
