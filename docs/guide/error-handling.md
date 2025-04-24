# Error Handling

Switchblade provides a robust error handling mechanism to manage and respond to errors across your application.

::: warning
Error handler is applied globally, it runs for all routes and middleware in the order they are defined. **Yes, you can have multiple error handlers**.
:::

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

## Validation Errors

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

app.onError((error, req, res) => {
    if (error instanceof SBValidationError) {
        return res.json(400, {
            message: "Validation Failed",
            errors: error.details,
        });
    }

    // Handle other errors
});
```

## Custom Error Classes

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
