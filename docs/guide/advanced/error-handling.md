# Error Handling

Error handling handles the error in chains, it runs like [Middleware](middleware.md), so the error handler is only applied to the middleware/route handler below it. With it, you can handle errors in a specific group with specific way.

## Usage

::: tip
By default, if no error handler is defined, it will return a 500 "Internal Server Error".
:::

```typescript
import { Switchblade } from "@takodotid/switchblade";
import { AssertError } from "@sinclair/typebox/value";
import { ZodError } from "zod";

const app = new Switchblade()
    // Global error handler since it's defined first before any route/middleware
    .onError((error, req, res) => {
        // Zod validation error
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "Validation Failed",
                errors: error.details,
            });
        }

        // Typebox Error
        if (error instanceof AssertError) {
            return res.status(400).json({
                message: "Validation Failed",
                errors: error.details,
            });
        }

        console.error(error);

        // Generic server error
        return res.status(500).json({
            message: "Internal Server Error",
            error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred",
        });
    });
```
