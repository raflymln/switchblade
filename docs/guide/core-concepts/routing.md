# Routing

Switchblade provides a flexible and intuitive routing system that supports various HTTP methods and advanced routing patterns.

We recommend using the **chaining-approach** for defining routes, as it allows for a cleaner and more organized structure. However, you can also use declaration-approach if you prefer.

::: code-group

```ts [Chaining-approach]
new Switchblade()
    .onError((error, req, res) => {
        res.status(500).json({ error: error.message });
    })
    .use((req, res, next) => {
        console.log("Middleware for all routes");
        next();
    })
    .get("/hello", (req, res) => {
        return res.status(200).text("Hello World");
    })
    .group("/group", controller);
```

```ts [Declaration-approach]
const app = new Switchblade();

app.onError((error, req, res) => {
    res.status(500).json({ error: error.message });
});

app.use((req, res) => {
    // Middleware for all routes
    console.log("Middleware for all routes");
});

app.get("/hello", (req, res) => {
    return res.status(200).text("Hello World");
});
```

:::

## Basic Routing

### HTTP Methods

Switchblade supports standard HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS), but **you can also use custom HTTP methods**, see this example:

```typescript
const app = new Switchblade();

// Register "/hello" route for GET method
app.get("/hello", (req, res) => {
    return res.status(200).text("Hello World");
});

// Register "/ping" for all standard HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
app.all("/ping", (req, res) => {
    return res.status(204).end();
});

// Register "/search" for custom HTTP method "FIND"
app.route("FIND", "/search", (req, res) => {
    const { q } = req.query;
    return res.status(200).json({ results: [] });
});
```

## Route Parameters

::: warning
The path parameters follows the adapter that you are using. In this example, we are using Hono. Some frameworks may have different syntax for route parameters.
:::

```typescript
app.get("/users/:id/:action", (req, res) => {
    const { id, action } = req.params;
    return res.status(200).json({
        message: `User ID: ${id}, Action: ${action}`,
    });
});
```

## Route Grouping

Create route groups with shared middleware or base paths. You can use either a callback approach or a sub-instance approach.

### Callback Approach

```typescript
app.group("/api/v1", (group) => {
    return group
        .use((req, res, next) => {
            // Middleware for all routes in this group
            console.log("API v1 middleware");
            next();
        })
        .get("/users", (req, res) => {
            // Handles GET /api/v1/users
        })
        .post("/users", (req, res) => {
            // Handles POST /api/v1/users
        });
});
```

### Sub-Instance Approach

```typescript
const apiV1 = new Switchblade()
    .use((req, res, next) => {
        // Middleware for all routes in this group
        console.log("API v1 middleware");
        next();
    })
    .get("/users", (req, res) => {
        // Handles GET /api/v1/users
    })
    .post("/users", (req, res) => {
        // Handles POST /api/v1/users
    });

app.group("/api/v1", apiV1);
```

## Route Grouping Without Changing Base Path

```typescript
const app = new Switchblade()
    .group("/", (group) => {
        return group
            .get("/users", (req, res) => {
                // Handles GET /users
            })
            .post("/users", (req, res) => {
                // Handles POST /users
            });
    })
    // Will throw an error since GET /users already exists
    .get("/users", (req, res) => {});
```
