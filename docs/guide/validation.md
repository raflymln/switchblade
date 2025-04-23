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

## Validation Locations

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

Validate response data to ensure type safety:

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
    }
);
```

## Complex Validation Scenarios

### Conditional Validation

```typescript
const RegistrationSchema = z
    .object({
        email: z.string().email(),
        password: z.string().min(8),
        accountType: z.enum(["personal", "business"]),
        businessDetails: z
            .object({
                companyName: z.string(),
                taxId: z.string(),
            })
            .optional()
            .refine((data) => data !== undefined, { message: "Business details required for business accounts" }),
    })
    .refine((data) => data.accountType === "personal" || data.businessDetails, { message: "Business details are required for business accounts" });

app.post(
    "/register",
    (req, res) => {
        const userData = req.body;
        return res.json(201, { message: "Registration successful" });
    },
    {
        body: RegistrationSchema,
    }
);
```

## Validation Performance

Switchblade's validation is designed to be lightweight and fast:

- Validates only when necessary
- Minimal runtime overhead
- Catches errors early in the request lifecycle

## Common Validation Patterns

### Sanitization and Transformation

```typescript
const CleanUserSchema = z.object({
    // Trim whitespace and convert to lowercase
    email: z
        .string()
        .email()
        .transform((val) => val.trim().toLowerCase()),

    // Ensure age is a positive integer
    age: z.number().int().positive(),

    // Remove extra whitespace from name
    name: z.string().transform((val) => val.trim()),
});
```

### Custom Validation

```typescript
const StrongPasswordSchema = z.string().refine(
    (password) => {
        // Custom password strength check
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    },
    { message: "Password must be strong" }
);
```

## Best Practices

1. **Validate Everything**

    - Always validate inputs
    - Include validation for all request parts
    - Use type-safe schemas

2. **Be Specific**

    - Use precise validation rules
    - Provide clear error messages
    - Limit input to expected types and ranges

3. **Performance Considerations**
    - Keep validation rules simple
    - Avoid overly complex validation logic
    - Use built-in schema methods when possible

## Troubleshooting

### Common Validation Errors

- **Unexpected Type**: Ensure input matches schema
- **Missing Required Fields**: Check schema requirements
- **Complex Validation Failures**: Use `.refine()` for custom checks

## Migration and Compatibility

- Easy to migrate from existing validation approaches
- Works with TypeScript for full type inference
- Supports multiple validation libraries

## Next Steps

- [Learn about Routing](/guide/routing)
- [Understand Adapters](/guide/adapters)
- [OpenAPI Documentation](/guide/openapi)

## Community and Support

Found a validation edge case? Need help?

- [Open a GitHub Issue](https://github.com/takodotid/switchblade/issues)
- [Join our Discord Community](https://discord.gg/your-discord-link)
