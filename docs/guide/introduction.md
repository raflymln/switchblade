# Introduction to Switchblade

## What is Switchblade?

Switchblade is a next-generation JavaScript backend framework designed to provide developers with a powerful, validation-first, and OpenAPI-ready development experience. Built by the team behind Tako, it aims to simplify backend development while enforcing best practices.

## Core Principles

### 1. Validation-First Approach

Switchblade puts validation at the forefront of your application design. Unlike traditional frameworks where validation is an afterthought, Switchblade encourages you to define validation schemas for:

- Request parameters
- Query strings
- Request headers
- Request body
- Cookies
- Response data

```typescript
app.post(
    "/users",
    (req, res) => {
        // Your logic here
    },
    {
        body: {
            name: z.string().min(2, "Name too short"),
            email: z.string().email("Invalid email format"),
        },
    }
);
```

### 2. Documentation-Driven Development

Generate OpenAPI documentation automatically with minimal configuration. Your API specs are generated directly from your route definitions.

## Key Features

- 🛡️ **Comprehensive Validation**: Validate everything with Zod and TypeBox
- 🔀 **Framework Adapters**: Switch between Hono, Express, and more
- 📄 **Automatic OpenAPI**: Generate documentation effortlessly
- 🚀 **TypeScript-First**: Strongly typed and intuitive API

## Supported Validation Libraries

- [x] Zod
- [x] TypeBox
- [ ] Yup (Coming Soon)
- [ ] Joi (Coming Soon)

## Framework Adapters

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

## Why Choose Switchblade?

Switchblade is more than a framework—it's a development philosophy. We believe in:

- Catching errors early
- Making documentation a first-class citizen
- Providing flexibility without complexity

## Support

If you find value in Switchblade, consider supporting Tako, the digital tipping platform that powers this framework.

[Donate to Tako](https://tako.id/tako)
