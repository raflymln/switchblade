# Routing

Switchblade provides a flexible and intuitive routing system that supports various HTTP methods and advanced routing patterns.

## Basic Routing

### HTTP Methods

Switchblade supports standard HTTP methods:

```typescript
const app = new Switchblade();

// GET Route
app.get("/users", (req, res) => {
    return res.json(200, { users: [] });
});

// POST Route
app.post("/users", (req, res) => {
    return res.json(201, { message: "User created" });
});

// PUT Route
app.put("/users/:id", (req, res) => {
    return res.json(200, { message: "User updated" });
});

// DELETE Route
app.delete("/users/:id", (req, res) => {
    return res.json(200, { message: "User deleted" });
});
```

## Route Parameters

Extract route parameters easily:

::: warning
The `path` for parameters follows the adapter that you are using. In this example, we are using the Hono adapter.
:::

```typescript
app.get("/users/:id", (req, res) => {
    const userId = req.params.id;
    return res.json(200, { id: userId });
});
```

## Query Parameters

Access query parameters with built-in validation:

```typescript
app.get(
    "/users",
    (req, res) => {
        const { page, limit } = req.query;
        return res.json(200, {
            users: [],
            page: Number(page) || 1,
            limit: Number(limit) || 10,
        });
    },
    {
        query: {
            page: z.number().optional(),
            limit: z.number().min(1).max(100).optional(),
        },
    }
);
```

## Route Grouping

Create route groups with shared middleware or base paths:

```typescript
app.group("/api/v1", (group) => {
    return group
        .get("/users", (req, res) => {
            // Handles GET /api/v1/users
        })
        .post("/users", (req, res) => {
            // Handles POST /api/v1/users
        });
});
```

## Catch-All Routes

Use the `all` method to handle multiple HTTP methods:

```typescript
app.all("/health", (req, res) => {
    return res.json(200, { status: "OK" });
});
```

## Middleware & Advanced Routing

Add middleware to specific routes or route groups. The middleware will affect the bottom route in the chain:

```typescript
const app = new Switchblade()
    .use((req, res) => {
        if (!req.headers.authorization) {
            // Throw an error to stop the request,
            // use `app.onError` to handle it
            throw new Error("Unauthorized");
        }

        // No need for `next()` in here,
        // if no error is thrown, the request will continue
    })
    .get("/protected", (req, res) => {
        return res.json(200, { message: "Protected route" });
    })
    .group("/admin", (group) => {
        return group
            .use((req, res) => {
                // Middleware for all admin routes
                // This will not affect the previous route
            })
            .get("/dashboard", (req, res) => {
                return res.json(200, { message: "Admin dashboard" });
            });
    })
    // This route will not be affected by the middleware in the admin group
    .post("/login", (req, res) => {
        const { username, password } = req.body;
        return res.json(200, { message: "Logged in" });
    });
```
