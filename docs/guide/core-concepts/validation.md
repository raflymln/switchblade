# Validation

Validation is at the core of Switchblade. We support multiple validation libraries to give you flexibility while maintaining type safety.

## Supported Validation Libraries

- [x] [Zod](https://zod.dev)
- [x] [TypeBox](https://github.com/sinclairzx81/typebox)

We don't discuss how to use these libraries in detail, you can refer to their respective documentation for that. However, we will provide a brief overview of how to use them with Switchblade.

## Request Validation

For params like `params`, `query`, `headers`, `cookies`, the validation object **is validated before the middlewares & request handler** is executed. `body` validation is when using `.json()` method.

::: tip
`req.json()` supports these content types:

- `application/json`
- `application/x-www-form-urlencoded`
- `multipart/form-data`

To validate it, make sure the validation schema for that content type is an object.

`req.json()` will automatically parse the request body based on the request content type. But the type that it infers is `application/json` by default. So, if you want to use `req.json()` for other content types, you need to specify the content type in the type generic, for example:

```typescript
const data = req.json<"application/x-www-form-urlencoded">();
```

:::

::: info Validation Options Type

- Param validation: `[param name]` → `[schema]`
- Body validation: `content` → `[content type]` → `[schema]`

:::

::: warning Headers must ALWAYS be lowercase
You can send fetch request with headers in uppercase, but Switchblade will always convert them to lowercase. So, make sure to use lowercase when validating headers.

Also the type-safe system will make it error if you use uppercase headers in the validation object.
:::

```typescript
app.get(
    "/users/:id",
    (req, res) => {
        const { id } = req.params;

        if (req.contentType === "text/plain") {
            return res.text(`Found user with ID: ${id}`);
        }

        const { name, age } = req.json();

        return res.json({
            id,
            name,
            age,
        });
    },
    {
        params: {
            // Zod example
            id: z.string().uuid("Invalid user ID"),
        },
        query: {
            page: z.number().min(1).optional(),
        },
        headers: {
            // Always use lowercase for header names
            "x-api-key": z.string().length(32, "Invalid API key"),
        },
        cookies: {
            // You can also use TypeBox here
            sessionId: Type.String({
                minLength: 32,
                maxLength: 32,
            }),
        },
        body: {
            // [content type] -> [schema]
            content: {
                // Typebox and zod can be used interchangeably everywhere
                "application/json": z.object({
                    name: z.string().min(1),
                    age: z.number().min(0),
                }),
                "text/plain": Type.String(),
            },
        },
    }
);
```

## Response Validation

Validation in responses is based on the returning status code and content type.

By default, the response object has `200` status code and `application/json` content type. You can override this by specifying the status code and content type using `.status()` and `.setContentType()` methods.

::: info Validation Options Type

- Content Validation: `[status code]` → `content` → `[content type]` → `[schema]`
- Headers Validation: `[status code]` → `headers` → `[header name]` → `[schema]`

:::

```typescript
app.post(
    "/users",
    (req, res) => {
        const newUser = {
            id: Date.now(),
            name: req.body.name,
        };

        if (req.contentType === "application/xml") {
            // Set content type to XML
            return res.status(201).setContentType("application/xml").send(toXML(newUser));
        }

        // .json() automatically sets the content type to `application/json`
        return res.status(201).json(newUser);
    },
    {
        responses: {
            201: {
                content: {
                    "application/json": z.object({
                        id: z.number(),
                        name: z.string(),
                    }),
                    "application/xml": Type.String(),
                },
                headers: {
                    location: z.string().url(),
                },
            },
            400: {
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
