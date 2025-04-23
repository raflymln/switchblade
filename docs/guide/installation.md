# Installation and Setup

## Prerequisites

Before installing Switchblade, ensure you have:

- Node.js (v18+ recommended)
- npm or pnpm
- TypeScript (recommended)

## Installation

You can install Switchblade using your preferred package manager:

::: code-group

```bash [npm]
npm install @takodotid/switchblade zod @sinclair/typebox
```

```bash [pnpm]
pnpm add @takodotid/switchblade zod @sinclair/typebox
```

```bash [yarn]
yarn add @takodotid/switchblade zod @sinclair/typebox
```

:::

## Project Setup

### 1. Create a New Project

```bash
mkdir my-switchblade-app
cd my-switchblade-app
npm init -y
```

### 2. Install Dependencies

```bash
npm install @takodotid/switchblade zod @sinclair/typebox @hono/node-server
```

### 3. TypeScript Configuration

Create a `tsconfig.json` in your project root:

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
    }
}
```

### 4. First Switchblade App

Create an `index.ts` file:

```typescript
import { Switchblade } from "@takodotid/switchblade";
import { createHonoAdapter } from "@takodotid/switchblade/adapters/hono";
import { serve } from "@hono/node-server";
import { z } from "zod";

// Create Switchblade app
const app = new Switchblade();

// Define a route
app.get("/", (req, res) => {
    return res.json(200, { message: "Hello, Switchblade!" });
});

// Create Hono adapter and start server
const hono = createHonoAdapter(app);
serve({ fetch: hono.fetch, port: 3000 }, () => console.log("Server running on http://localhost:3000"));
```

### 5. Add Scripts to `package.json`

```json
{
    "scripts": {
        "start": "tsx index.ts",
        "dev": "tsx watch index.ts"
    }
}
```

## Running the Application

::: code-group

```bash [npm]
npm start
```

```bash [pnpm]
pnpm start
```

```bash [yarn]
yarn start
```

:::

## Next Steps

- [Learn about Routing](/guide/routing)
- [Explore Validation](/guide/validation)
- [Understand Adapters](/guide/adapters)

## Troubleshooting

### Common Issues

- **Validation Errors**: Ensure you've imported the correct validation library
- **Adapter Problems**: Check that you've installed the correct adapter
- **TypeScript Errors**: Verify your `tsconfig.json` settings

## Community Support

- [GitHub Issues](https://github.com/takodotid/switchblade/issues)
- [Discord Community](https://discord.gg/your-discord-link)
