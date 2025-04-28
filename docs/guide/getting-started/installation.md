# Installation and Setup

## Prerequisites

- Node.js 18+
- npm, pnpm, yarn, bun, or any other package manager
- TypeScript (recommended)
- Patience (optional, but highly recommended)

## Installation

1. Install Switchblade and the desired validation library. **You only need to install the one you plan to use**, but if you want to use all, what are we to judge? 🤷‍♂️😏

::: code-group

```bash [Zod]
npm install @takodotid/switchblade zod
```

```bash [TypeBox]
npm install @takodotid/switchblade @sinclair/typebox
```

:::

2. Install the desired adapter.

::: code-group

```bash [Hono]
npm install hono @hono/node-server
```

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

Create a `tsconfig.json`, here's the recommended configuration:

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

See [Quick Example](introduction.md#quick-example) for a simple example of how to use Switchblade.

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
npm dev # Will restart the server on changes
```
