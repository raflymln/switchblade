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

## Middleware in Routes

Add middleware to specific routes or route groups:

```typescript
app.get(
    "/protected",
    (req, res, next) => {
        // Authentication middleware
        if (!req.headers.authorization) {
            return res.json(401, { error: "Unauthorized" });
        }
        next();
    },
    (req, res) => {
        return res.json(200, { secret: "data" });
    }
);
```

## Advanced Routing with Validation

Combine routing with comprehensive validation:

```typescript
app.post(
    "/users",
    (req, res) => {
        const { name, email } = req.body;
        return res.json(201, { id: 1, name, email });
    },
    {
        body: {
            name: z.string().min(2, "Name too short"),
            email: z.string().email("Invalid email"),
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
```

## Best Practices

- Keep routes focused and single-purpose
- Use validation to ensure data integrity
- Leverage middleware for cross-cutting concerns
- Use route grouping for logical organization

## Common Pitfalls

- Avoid duplicating route definitions
- Be consistent with your error handling
- Use proper status codes
- Validate and sanitize all inputs

## Next Steps

- [Learn about Validation](/guide/validation)
- [Understand Adapters](/guide/adapters)
- [OpenAPI Documentation](/guide/openapi)
