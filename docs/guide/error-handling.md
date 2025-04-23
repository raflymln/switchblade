# Error Handling

Switchblade provides a robust error handling mechanism to manage and respond to errors across your application.

## Global Error Handler

```typescript
import { Switchblade } from "@takodotid/switchblade";

const app = new Switchblade();

// Global error handler
app.onError((error, req, res) => {
    // Log the error
    console.error(error);

    // Determine error type and respond accordingly
    if (error instanceof SBValidationError) {
        return res.json(400, {
            message: "Validation Failed",
            errors: error.details,
        });
    }

    // Generic server error
    return res.json(500, {
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred",
    });
});
```

## Types of Errors

### Validation Errors

```typescript
import { z } from "zod";

app.post(
    "/users",
    (req, res) => {
        // Validation happens automatically
        const { name, email } = req.body;
        // Route logic
    },
    {
        body: {
            name: z.string().min(2, "Name is too short"),
            email: z.string().email("Invalid email format"),
        },
    }
);

// Validation errors are automatically caught
// and can be handled in the global error handler
```

### Custom Error Classes

```typescript
// Define custom error classes
class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthenticationError";
    }
}

class ResourceNotFoundError extends Error {
    constructor(resource: string) {
        super(`${resource} not found`);
        this.name = "ResourceNotFoundError";
    }
}

app.onError((error, req, res) => {
    if (error instanceof AuthenticationError) {
        return res.json(401, {
            message: error.message,
        });
    }

    if (error instanceof ResourceNotFoundError) {
        return res.json(404, {
            message: error.message,
        });
    }

    // Fallback to generic error handler
    return res.json(500, {
        message: "Unexpected error occurred",
    });
});

// Throwing custom errors in route handlers
app.get("/users/:id", (req, res) => {
    const user = findUserById(req.params.id);

    if (!user) {
        throw new ResourceNotFoundError("User");
    }
});
```

## Async Error Handling

```typescript
app.get("/data", async (req, res) => {
    try {
        // Async operation that might fail
        const data = await fetchExternalData();
        return res.json(200, data);
    } catch (error) {
        // Errors in async functions are automatically caught
        // by the global error handler
        throw error;
    }
});
```

## Middleware Error Handling

```typescript
// Middleware can also throw errors
app.use(async (req, res) => {
    try {
        // Authentication middleware
        const token = req.headers.authorization;
        if (!token) {
            throw new AuthenticationError("No token provided");
        }

        const user = await validateToken(token);
        req.state.user = user;
    } catch (error) {
        // Errors in middleware propagate to global error handler
        throw error;
    }
});
```

## Best Practices

1. **Be Specific**

    - Create custom error classes for different error types
    - Provide clear, informative error messages

2. **Security**

    - Avoid exposing sensitive error details in production
    - Log full error details server-side
    - Send generic messages to clients

3. **Consistent Error Response**
    ```typescript
    interface ErrorResponse {
        message: string;
        code?: string;
        details?: any;
    }
    ```

## Error Logging

```typescript
app.onError((error, req, res) => {
    // Log to external service or file
    logErrorToService({
        error,
        request: {
            method: req.method,
            path: req.url,
            body: req.body,
        },
    });

    // Respond to client
    return res.json(500, {
        message: "An error occurred",
    });
});
```

## Common Error Scenarios

- Validation errors
- Authentication failures
- Resource not found
- External service errors
- Database connection issues

## Troubleshooting

- Ensure all async functions use try/catch
- Check error propagation
- Verify error handler catches all expected errors
- Test error scenarios thoroughly

## Performance Considerations

- Avoid complex error handling logic
- Use lightweight error classes
- Minimize error logging overhead

## Community and Support

- [GitHub Issues](https://github.com/takodotid/switchblade/issues)
- [Discord Community](https://discord.gg/your-discord-link)
