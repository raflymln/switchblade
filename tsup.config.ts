import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts", "src/adapters/hono.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    minify: true,
    sourcemap: true,
    target: "es2022",
});
