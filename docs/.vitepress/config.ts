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
            { text: "Docs", link: "/guide/getting-started/introduction" },
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
                        { text: "Introduction", link: "/guide/getting-started/introduction" },
                        { text: "Installation", link: "/guide/getting-started/installation" },
                    ],
                },
                {
                    text: "Core Concepts",
                    items: [
                        { text: "Routing", link: "/guide/core-concepts/routing" },
                        { text: "Request", link: "/guide/core-concepts/request" },
                        { text: "Response", link: "/guide/core-concepts/response" },
                        { text: "Validation", link: "/guide/core-concepts/validation" },
                        { text: "Adapters", link: "/guide/core-concepts/adapters" },
                        { text: "OpenAPI", link: "/guide/core-concepts/openapi" },
                    ],
                },
                {
                    text: "Advanced Topics",
                    items: [
                        { text: "Middleware", link: "/guide/advanced/middleware" },
                        { text: "Error Handling", link: "/guide/advanced/error-handling" },
                        { text: "Testing", link: "/guide/advanced/testing" },
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
        // ["link", { rel: "icon", href: "/favicon.ico" }],
        ["meta", { name: "og:title", content: "Switchblade" }],
        ["meta", { name: "og:description", content: "2nd level Javascript framework abstraction" }],
    ],
});
