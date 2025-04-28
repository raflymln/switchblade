# Switchblade vs Other Libraries

Why do we create Switchblade when there are already many library available with much more features like Elysia? Why do we reinvent the wheel?

**The answer is simple**: we don't find one that fits our needs.

Before making Switchblade, we have tried and testing various libraries, from h3 to Elysia. And from all of that, Elysia is the one that we find the most suitable for our needs. Here's our takeaway on various libraries:

## H3

Simple and easy to use, but lacks a lot of features, such as OpenAPI. Even though it has composable helpers, but adding it will resulting in a lot of imports and often at higher-level codebase, it'd be a pain to manage.

## Elysia

Elysia by far is the most feature-rich library, how we build the code is also the first thing why we love them, however it has 3 problems for us:

1. Its validation depends only on Typebox, we use Zod for validation and the reason is because Zod is the most simpler and easiest to use, and it's parsing-approach instead of Typebox which only validate-approach.
2. It's too type-safe-heavy, at large codebase like Tako, since Elysia is passing the route type when we register the route, at the end when we open up our codebase, we need to take some time to make sure the IDE loading the type for the codebase, and as the codebase grows, the type becomes more and more heavy, resulting in a bad DX especially when we need to make some simple change, but took some time to load only the type.
3. The middleware is running in chain instead of wrapping the next middleware/handler, which when we try to use things like `AsyncLocalStorage`, it requires us to use `asyncLocalStorage.enterWith` which is experimental and often does a memory leak.

## Hono

We love it, simple, runtime agnostic, the reason why we make Switchblade modular. However when having a large codebase, we like an approach using RoR-like controller, and Hono doesn't have that. They style their code in a functional way, like when you create a middleware, you need to define the route that the middleware is applied, you can't just put the middleware in the group like Switchblade does, we don't like it.

But overall Hono is fit what we need, not too type-safe-heavy, runtime agnostic, OpenAPI support, big community, we recommend it if you want to create a simple and fast web framework.

> P.S. The options for OpenAPI validation in Switchblade is inspired by Hono.

## Nest.js

When looking for RoR-like controller approach, Nest.js is the one that we find the most suitable, but the problem is simple:

1. The setup is pain in the head, you can't just install the package, code, and run it, so much that you need to setup.
2. It's too much for a simple app, but for a large codebase, it's great!

Yet, it has a lot of features, and the community is big, so if you want to create a large codebase, we recommend it. But for us, we don't need that much features, and we don't want to setup a lot of things just to run our app.

## Express

Who doesn't start with Express? Who doesn't love Express at first? However, as the developer ecosystem grows, sadly express doesn't. If you're a new Javascript developer, feel free to use Express, but:

1. It's too bloated, no wonder since it's one of the oldest backend framework ever exists in the Node.js ecosystem.
2. It's not compatible in serverless environment.
3. Not type-safe by default
4. Its performance, compared to modern framework, is bad.

The community is big, the ecosystem is also big, but we can't just depends on the community for a long run, especially if there's a vulnerability, or if the package is abandoned. But still worth the shot if you're new to the backend world.

## Hapi

Feature rich, semi-easy to use, fits for medium to large codebase, but the problem is simple: the validation depends only on Joi. Also we don't really like the documentation, not very clear and straightforward.

## Encore

Encore is high-performance, the ecosystem is covering a lot of things. When we looks at the benchmark, actually we are planning to migrate from Elysia to Encore, but it's very opinionated, in terms of just making a simple app, you need to setup like the config file, the index file, etc., much like Prisma compares to Drizzle.

It's not beginner friendly, but if you planned to make a medium to large codebase, it's great, especially with the Typescript support, and it's performance.

## Other Libraries

If we count up various library, even the fullstack one like Next.js, Sails, AdonisJS, FeatherJS, etc. It's either too opinionated, too bloated, the way of coding is either too confusing or too "bloated", and sometimes the documentation is not very clear and straightforward.

## Conclusion

We don't really want to acknowledge that Switchblade is the best framework ever, but the reason why we create Switchblade is because we need a system that's fit our needs, and judging by various library that we have tried, we think Switchblade now offers the best of both worlds, a simple and easy to use framework, with a lot of features, and we also tried to make sure the documentation is clear and straightforward, so that you can easily understand how to use it.
