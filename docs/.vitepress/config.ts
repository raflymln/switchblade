import { defineConfig } from "vitepress";

export default defineConfig({
    title: "Switchblade",
    description: "A Modern Backend Framework for TypeScript Developers",
    ignoreDeadLinks: true,

    // Theme configuration
    themeConfig: {
        // Navigation links
        nav: [
            { text: "Home", link: "/" },
            { text: "Docs", link: "/guide/introduction" },
            {
                text: "Resources",
                items: [
                    { text: "GitHub", link: "https://github.com/takodotid/switchblade" },
                    { text: "Support Tako", link: "https://tako.id/tako" },
                ],
            },
        ],

        // Sidebar configuration
        sidebar: {
            "/guide/": [
                {
                    text: "Getting Started",
                    items: [
                        { text: "Introduction", link: "/guide/introduction" },
                        { text: "Installation", link: "/guide/installation" },
                    ],
                },
                {
                    text: "Core Concepts",
                    items: [
                        { text: "Routing", link: "/guide/routing" },
                        { text: "Validation", link: "/guide/validation" },
                        { text: "Adapters", link: "/guide/adapters" },
                        { text: "OpenAPI", link: "/guide/openapi" },
                    ],
                },
                {
                    text: "Advanced Topics",
                    items: [
                        { text: "Middleware", link: "/guide/middleware" },
                        { text: "Error Handling", link: "/guide/error-handling" },
                    ],
                },
            ],
        },

        // Social links
        socialLinks: [{ icon: "github", link: "https://github.com/takodotid/switchblade" }],

        // Footer configuration
        footer: {
            message: "Released under the MIT License.",
            copyright: "Copyright © 2024 PT Hobimu Jadi Cuan (Tako)",
        },
    },

    // Markdown configuration
    markdown: {
        theme: {
            light: "github-light",
            dark: "github-dark",
        },
    },

    // Optional: Custom head tags
    head: [
        ["link", { rel: "icon", href: "/favicon.ico" }],
        ["meta", { name: "og:title", content: "Switchblade" }],
        ["meta", { name: "og:description", content: "A Modern Backend Framework for TypeScript Developers" }],
    ],
});
