import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts", "src/adapters/hono.ts"],
    format: ["esm"],
    dts: true,
    platform: "node",
    target: "es2024",
    clean: true,
    sourcemap: true,
});
