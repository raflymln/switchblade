---
layout: home

hero:
    name: Switchblade
    text: Powerful Backend Framework
    tagline: Validation-First. OpenAPI-Driven. Adapter-Friendly.
    image:
        src: /logo.png
        alt: Switchblade Logo
    actions:
        - theme: brand
          text: Get Started
          link: /guide/introduction
        - theme: alt
          text: View on GitHub
          link: https://github.com/takodotid/switchblade

features:
    - icon: 🛡️
      title: Validation-First
      details: Comprehensive input validation with Zod and TypeBox. Catch errors early and ensure data integrity.
    - icon: 🔀
      title: Adapter-Friendly
      details: Seamlessly switch between Hono, Express, and other backends. Flexible architecture for any project.
    - icon: 📄
      title: OpenAPI Generation
      details: Automatic API documentation with minimal configuration. Keep your docs always in sync.
    - icon: 🚀
      title: TypeScript-Powered
      details: Full TypeScript support with robust type inference. Strongly typed APIs out of the box.
---

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

## Why Switchblade?

Switchblade is more than a framework—it's a development philosophy. We believe in:

- Catching errors early
- Making documentation a first-class citizen
- Providing flexibility without complexity

## Community Support

- [GitHub Repository](https://github.com/takodotid/switchblade)
- [Support Tako](https://tako.id/tako)

## Getting Started

1. [Installation](/guide/installation)
2. [Routing Guide](/guide/routing)
3. [Validation Deep Dive](/guide/validation)
