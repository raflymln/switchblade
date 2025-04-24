# Introduction to Switchblade

## What is Switchblade?

Switchblade is a modern, type-safe backend framework for TypeScript that emphasizes:

- Robust validation
- Flexible routing
- Automatic API documentation
- Multiple validation library support

## Core Philosophy

1. **Validation-First Approach**

    - Validate all incoming data before processing
    - Support multiple validation libraries
    - Catch errors early in the request lifecycle

2. **Developer Experience**
    - Intuitive API design
    - Minimal configuration
    - Strong TypeScript integration

## Key Features

- 🛡️ Comprehensive input validation
- 🔀 Adapter-based architecture
- 📄 Automatic OpenAPI generation
- 🚀 TypeScript-first design

## Supported Validation Libraries

- [x] Zod
- [x] TypeBox
- [ ] Yup (Coming Soon)
- [ ] Joi (Coming Soon)

## Supported Adapters

- [x] Hono
- [ ] Express (Coming Soon)
- [ ] Fastify (Coming Soon)

## Quick Example

```typescript
import { Switchblade } from "@takodotid/switchblade";
import { z } from "zod";

const app = new Switchblade();

app.post(
    "/users",
    (req, res) => {
        const { name, email } = req.body;
        return res.json(201, { id: 1, name, email });
    },
    {
        body: {
            name: z.string().min(2),
            email: z.string().email(),
        },
    }
);
```
