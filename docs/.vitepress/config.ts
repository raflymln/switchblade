import { defineConfig } from "vitepress";

import taskLists from "markdown-it-task-lists";

export default defineConfig({
    title: "Switchblade",
    description: "A Modern Backend Framework for TypeScript Developers",
    ignoreDeadLinks: true,
    lastUpdated: true,

    // Theme configuration
    themeConfig: {
        lastUpdated: {
            text: "Last Updated",
        },

        search: {
            provider: "local",
        },

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

        socialLinks: [{ icon: "github", link: "https://github.com/takodotid/switchblade" }],

        footer: {
            message: "Released under the MIT License.",
            copyright: "Copyright © 2024 PT Hobimu Jadi Cuan (Tako)",
        },
    },

    markdown: {
        theme: {
            light: "github-light",
            dark: "github-dark",
        },
        config: (md) => {
            md.use(taskLists);
        },
    },

    head: [
        ["link", { rel: "icon", href: "/favicon.ico" }],
        ["meta", { name: "og:title", content: "Switchblade" }],
        ["meta", { name: "og:description", content: "2nd level Javascript framework abstraction" }],
    ],
});
