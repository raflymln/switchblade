# Validation

Validation is at the core of Switchblade. We support multiple validation libraries to give you flexibility while maintaining type safety.

## Supported Validation Libraries

- [x] Zod
- [x] TypeBox
- [ ] Yup (Coming Soon)
- [ ] Joi (Coming Soon)

## Zod Validation

### Basic Validation

```typescript
import { z } from "zod";

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
    }
);
```

### Advanced Zod Schemas

```typescript
const UserSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    age: z.number().min(18).max(120),
    role: z.enum(["admin", "user", "guest"]),
});

app.post(
    "/users",
    (req, res) => {
        const userData = req.body;
        return res.json(201, userData);
    },
    {
        body: UserSchema,
    }
);
```

## TypeBox Validation

```typescript
import t from "@sinclair/typebox";

app.post(
    "/products",
    (req, res) => {
        const { name, price } = req.body;
        return res.json(201, { id: 1, name, price });
    },
    {
        body: {
            name: t.String({ minLength: 2 }),
            price: t.Number({ minimum: 0 }),
        },
    }
);
```

## Request Validation

Switchblade allows validation across multiple request parts:

```typescript
app.get(
    "/users/:id",
    (req, res) => {
        const { id } = req.params;
        const { page } = req.query;
        return res.json(200, { id, page });
    },
    {
        params: {
            id: z.string().uuid("Invalid user ID"),
        },
        query: {
            page: z.number().min(1).optional(),
        },
        headers: {
            "x-api-key": z.string().length(32, "Invalid API key"),
        },
    }
);
```

## Response Validation

Switchblade supports comprehensive response validation using Zod or TypeBox.

### Basic Response Validation

```typescript
app.get(
    "/users",
    (req, res) => {
        return res.json(200, {
            users: [{ id: 1, name: "John Doe", email: "john@example.com" }],
        });
    },
    {
        responses: {
            200: {
                description: "Successful user retrieval",
                content: {
                    "application/json": z.object({
                        users: z.array(
                            z.object({
                                id: z.number(),
                                name: z.string(),
                                email: z.string().email(),
                            })
                        ),
                    }),
                },
            },
        },
    }
);
```

### Multiple Response Types

```typescript
app.post(
    "/users",
    (req, res) => {
        const newUser = { id: Date.now(), name: req.body.name };
        return res.json(201, newUser);
    },
    {
        responses: {
            201: {
                description: "User created successfully",
                content: {
                    "application/json": z.object({
                        id: z.number(),
                        name: z.string(),
                    }),
                },
                headers: {
                    Location: z.string().url(),
                },
            },
            400: {
                description: "Bad Request",
                content: {
                    "application/json": z.object({
                        error: z.string(),
                    }),
                },
            },
        },
    }
);
```
