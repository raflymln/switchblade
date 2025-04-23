# Switchblade 🔪

> #### Currently in **WORK IN PROGRESS**. Please check back later for updates.

## Fast, Typesafe, and Flexible Backend Framework

Switchblade is a next-generation JavaScript backend framework that cuts through complexity with precision and ease. Built by the team behind Tako, this framework is designed to provide developers with a powerful, validation-first, and OpenAPI-ready development experience.

### 🌟 Key Features

- **Validation-First Approach**: Comprehensive input validation out of the box
- **Multi-Schema Support**: Works seamlessly with Zod and TypeBox (with more to come)
- **Adapter-Friendly**: Easily switch between Hono, Express, and other backends
- **OpenAPI Generation**: Automatic API documentation with minimal configuration
- **Typescript-Like Developer Experience**: Strongly typed and intuitive API

### 🎯 Why Switchblade?

We created Switchblade with two core principles to address common pain points in backend development:

1. **Validation-First Philosophy** 🛡️

    - Modern web development demands rigorous data validation
    - Most frameworks treat validation as an afterthought
    - Switchblade makes validation the primary concern
    - Validate everything: params, queries, headers, bodies, and even responses
    - Catch errors early, before they reach your business logic
    - Reduce runtime errors and improve overall application reliability

2. **Documentation-Driven Development** 📘
    - OpenAPI (Swagger) documentation is crucial but often neglected
    - Developers rarely keep API docs in sync with code
    - Switchblade generates OpenAPI specs automatically
    - Documentation becomes a natural part of your development process
    - Zero-configuration OpenAPI generation
    - Encourages clear, well-documented APIs from the start

Our goal is to provide a framework that makes secure, well-documented APIs the default, not the exception.

### 🚀 Quick Start

### Bare Minimum Example

```typescript
import { Switchblade } from "@takodotid/switchblade";
import { createHonoAdapter } from "@takodotid/switchblade/adapters/hono";
import { serve } from "@hono/node-server";

// Create a simple Switchblade app
const app = new Switchblade();

// Define a basic route
app.get("/", (req, res) => {
    return res.json(200, { message: "Hello, Switchblade!" });
});

// Create Hono adapter and start server
const hono = createHonoAdapter(app);
serve({ fetch: hono.fetch, port: 3000 }, () => console.log("Server running on http://localhost:3000"));
```

### Advanced Usage Example

```typescript
import { Switchblade } from "@takodotid/switchblade";
import { createHonoAdapter } from "@takodotid/switchblade/adapters/hono";
import { serve } from "@hono/node-server";
import { z } from "zod";
import { String } from "@sinclair/typebox";

const app = new Switchblade();

// Route with input validation
app.post(
    "/users",
    (req, res) => {
        // Validated data is automatically typed and safe
        const { name, email } = req.body;
        return res.json(201, { id: 1, name, email });
    },
    {
        body: {
            name: z.string().min(2, "Name too short"), // Zod schema
            email: String({ format: "email" }), // TypeBox schema
        },
        responses: {
            201: {
                "application/json": z.object({
                    id: z.number(),
                    name: z.string(),
                    email: z.string().email(),
                }),
            },
        },
    }
);

// Create Hono adapter and start server
const hono = createHonoAdapter(app);
serve({ fetch: hono.fetch, port: 3000 }, () => console.log("Server running on http://localhost:3000"));
```

### 📦 Installation

```bash
npm install @takodotid/switchblade zod @sinclair/typebox
```

### 🔧 Supported Validation Libraries

- [x] Zod
- [x] TypeBox
- [ ] Yup (Coming Soon)
- [ ] Joi (Coming Soon)

### 🌈 Framework Adapters

- [x] Hono
- [ ] Express (Coming Soon)
- [ ] Fastify (Coming Soon)

### 💡 Philosophy

Switchblade is more than just a framework—it's a development approach. We believe in:

- **Validation by Default**: Catch errors early and precisely
- **Documentation as Code**: OpenAPI generation should be effortless
- **Flexibility**: Your tools should adapt to your needs, not vice versa

### 🤝 Support Tako

If you find value in Switchblade, consider supporting Tako, the digital tipping platform that powers this framework.

[Donate to Tako](https://tako.id/tako)

### 📄 License

MIT License

### 🐛 Issues & Contributions

Found a bug? Have a feature request?
[Open an Issue](https://github.com/takodotid/switchblade/issues)

Contributions are welcome! Please read our contributing guidelines before getting started.

### 🌟 Star the Project

If you like Switchblade, please give us a star on GitHub!
