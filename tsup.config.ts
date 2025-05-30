import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts", "src/adapters/hono.ts"],
    format: ["esm", "cjs"],
    dts: true,
    platform: "node",
    target: "es2024",
    sourcemap: true,
});
