# Middleware

Middleware in Switchblade provides a powerful way to intercept and modify requests and responses across your application.

## What is Middleware?

Middleware are functions that have access to the request and response objects. They can:

- Modify request or response
- Execute additional code
- End the request-response cycle
- Call the next middleware in the stack

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

## Types of Middleware

### Global Middleware

Applies to all routes:

```typescript
// Middleware applied to every route
app.use((req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
});
```

### Route Group Middleware

Applies to a specific group of routes:

```typescript
app.group("/api/v1", (group) => {
    // Middleware for this group
    group.use((req, res) => {
        // API versioning logic
        req.state.apiVersion = "v1";
    });

    // Routes in this group
    group.get("/users", (req, res) => {
        /* ... */
    });
    group.post("/users", (req, res) => {
        /* ... */
    });
});
```

### Async Middleware

```typescript
app.use(async (req, res) => {
    // Async operations like authentication
    try {
        const user = await validateToken(req.headers.authorization);
        req.state.user = user;
    } catch (error) {
        return res.json(401, { error: "Invalid token" });
    }
});
```

## Middleware Composition

```typescript
// Reusable middleware functions
const authenticate = async (req, res) => {
    if (!req.headers.authorization) {
        return res.json(401, { error: "Authentication required" });
    }
};

const logRequest = (req, res) => {
    console.log(`Request to ${req.url}`);
};

// Combine middlewares
app.get("/protected", authenticate, logRequest, (req, res) => {
    return res.json(200, { secretData: "Access granted" });
});
```

## Error Handling in Middleware

```typescript
app.use((req, res, next) => {
    try {
        // Some potentially failing operation
        next(); // Continue to next middleware
    } catch (error) {
        // Catch and handle errors
        return res.json(500, { error: "Middleware error" });
    }
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

## Best Practices

- Keep middleware functions focused
- Handle errors appropriately
- Avoid blocking operations in middleware
- Use async/await for asynchronous tasks
- Be mindful of middleware order

## Common Use Cases

- Authentication
- Logging
- CORS handling
- Request parsing
- Rate limiting
- Error tracking

## Limitations

- Middleware runs in the order they are defined
- Complex middleware can impact performance
- Be cautious of middleware that modifies request/response extensively

## Troubleshooting

- Ensure middleware calls `next()` or ends the request
- Check middleware execution order
- Handle potential errors in middleware

## Community and Support

- [GitHub Issues](https://github.com/takodotid/switchblade/issues)
- [Discord Community](https://discord.gg/your-discord-link)
