# OpenAPI Documentation

Switchblade provides built-in support for generating OpenAPI (Swagger) documentation with minimal configuration.

::: tip OpenAPI Version 3.1
The current available format is OpenAPI 3.1. If you need other versions, please open an issue.
:::

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
        components: {},
    },
});
```

> The `openapi` object follows the OpenAPI 3.1 specification.

## Automatic Documentation Generation

Switchblade automatically generates OpenAPI documentation based on your route definitions. You can use [zod-openapi](https://www.npmjs.com/package/zod-openapi) library to define openapi for your Zod schemas, or if you are using [Typebox](https://www.npmjs.com/package/@sinclair/typebox/v/0.23.3#OpenAPI), it's already compatible with OpenAPI.

```typescript
app.post(
    "/users",
    (req, res) => {
        const { name, email } = req.body;
        return res.json({ id: 1, name, email });
    },
    {
        body: {
            name: z.string().min(2).openapi({
                description: "User's full name",
                example: "John Doe",
            }),
            email: Type.String({
                format: "email",
                description: "User's email address",
                example: "user@mail.com",
            }),
        },
        openapi: {
            summary: "Create a new user",
            tags: ["Users"],
        },
    }
);
```

#### OpenAPI Metadata Options

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
        operationId: "operationId", // Unique identifier for the operation
        externalDocs: {
            description: "External documentation",
            url: "https://example.com/docs",
        },
        // Request Body are prefilled from the body schema
        // Response are prefilled from the response schema
    }
}
```

## Accessing OpenAPI Specification

```typescript
const app = new Switchblade({
    openapi: {
        info: {
            title: "My API",
            version: "1.0.0",
        },
    },
});

const openapiDoc = app.getOpenAPI31Document();
```

## Integrating Documentation UI (Swagger / Scalar / etc.)

You can use tools like Scalar to display the documentation, **please refer to the adapter documentation** for more details about how to integrate the documentation UI.

Example with Hono:

```typescript
import { Scalar } from "@scalar/hono-api-reference";

const app = new Switchblade({
    openapi: {
        info: {
            title: "My API",
            version: "1.0.0",
        },
    },
});

// Publish the OpenAPI document at /openapi.json
app.get("/openapi.json", (req, res) => {
    return res.json(app.getOpenAPI31Document());
});

const hono = createHonoAdapter(app);

// Serve the Scalar UI at /docs
hono.get("/docs", Scalar({ url: "/openapi.json" }));
```
