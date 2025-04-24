# OpenAPI Documentation

Switchblade provides built-in support for generating OpenAPI (Swagger) documentation with minimal configuration.

## Configuring OpenAPI

When creating a Switchblade application, you can provide OpenAPI configuration:

```typescript
const app = new Switchblade({
    basePath: "/api/v1",
    openapi: {
        openapi: "3.1.0",
        info: {
            title: "My API",
            version: "1.0.0",
            description: "API documentation for my application",
        },
        servers: [{ url: "http://localhost:3000" }],
    },
});
```

## Automatic Documentation Generation

Switchblade automatically generates OpenAPI documentation based on your route definitions:

```typescript
app.post(
    "/users",
    (req, res) => {
        const { name, email } = req.body;
        return res.json(201, { id: 1, name, email });
    },
    {
        body: {
            name: z.string().min(2).openapi({
                description: "User's full name",
                example: "John Doe",
            }),
            email: z.string().email().openapi({
                description: "User's email address",
                example: "john@example.com",
            }),
        },
        responses: {
            201: {
                description: "User created successfully",
                content: {
                    "application/json": z.object({
                        id: z.number(),
                        name: z.string(),
                        email: z.string().email(),
                    }),
                },
            },
        },
        openapi: {
            summary: "Create a new user",
            tags: ["Users"],
        },
    }
);
```

## Accessing OpenAPI Specification

::: info OpenAPI Version
The current available format is OpenAPI 3.1. You can access the document using the following method:
:::

```typescript
const openapiDoc = app.getOpenAPI31Document();
```

## Integrating Documentation UI (Swagger / Scalar / etc.)

You can use tools like Scalar to display the documentation:

```typescript
import { Scalar } from "@scalar/hono-api-reference";

// Publish the OpenAPI document
app.get("/openapi", (req, res) => {
    return res.json(200, app.getOpenAPI31Document());
});

// With Hono adapter
const hono = createHonoAdapter(app);
hono.get("/docs", Scalar({ url: "/openapi" }));
```

## OpenAPI Metadata Options

You can add additional metadata to your routes:

```typescript
{
    // ...params, body, cookies, etc.
    openapi: {
        summary: "Route description",
        description: "Detailed route information",
        tags: ["Category"],
        deprecated: false,
        hide: false, // `true` to hide from the documentation
    }
}
```
