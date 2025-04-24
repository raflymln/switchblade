# Installation and Setup

## Prerequisites

- Node.js 18+
- npm, pnpm, or yarn
- TypeScript (recommended)

## Installation

You can choose to install Switchblade with your preferred validation library:

::: code-group

```bash [Zod]
npm install @takodotid/switchblade zod
```

```bash [TypeBox]
npm install @takodotid/switchblade @sinclair/typebox
```

```bash [Optional: Hono Adapter]
npm install hono @hono/node-server
```

:::

::: tip Choose Your Validation Library
Switchblade supports multiple validation libraries. You only need to install the one you plan to use.
:::

## Project Setup

### 1. Create a New Project

```bash
mkdir switchblade-app
cd switchblade-app
npm init -y
```

### 2. Install Dependencies

See [Installation](#installation) for the required dependencies.

### 3. TypeScript Configuration

Create a `tsconfig.json`:

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "strict": true,
        "esModuleInterop": true
    }
}
```

### 4. First Switchblade App

Create an `index.ts`:

```typescript
import { Switchblade } from "@takodotid/switchblade";
import { createHonoAdapter } from "@takodotid/switchblade/adapters/hono";
import { serve } from "@hono/node-server";
import { z } from "zod";

const app = new Switchblade();

app.get("/", (req, res) => {
    return res.json(200, { message: "Hello, Switchblade!" });
});

const hono = createHonoAdapter(app);
serve({ fetch: hono.fetch, port: 3000 });
```

### 5. Add Scripts to `package.json`

::: tip Run Typescript using `tsx` library
To get started quickly, we recommend using the `tsx` library to run TypeScript files directly. With it, you can run TypeScript files without needing to compile them first.
:::

```json
{
    "scripts": {
        "start": "tsx index.ts",
        "dev": "tsx watch index.ts"
    }
}
```

## Running the Application

```bash
npm start
```
