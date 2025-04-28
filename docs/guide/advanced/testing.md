# Testing

Testing is easy, bring your own testing tools, or just use `node:test` to get the job done.

## Getting the Route

Use the `app.getRoute(method, path)` method to get the route you want to test.

::: tip
To get the route, pass the `path` variable the same way you registered it.

- ❌ `/hello/john`
- ✅ `/hello/:name`

:::

```ts
import { Switchblade } from "@takodotid/switchblade";

const app = new Switchblade().get("/hello/:name", (req, res) => {
    const name = req.params.name;
    res.send(`Hello ${name}!`);
});

const route = app.getRoute("GET", "/hello/:name");
```

## Running the Route

To run the route, use the `route.run(request, params)` method.

::: warning

1. Switchblade is not parsing the params from url, it's the adapter job that does it, so in testing like this, you need to pass the params manually.
2. Always `await` the `route.run()` method, because it returns a promise.

:::

```ts
const params = { name: "john" };
const request = new Request("http://localhost/hello/john", {
    method: "GET",
});

const response = await route.run(request, params);
```

## Usage Example

If you want to test the route with `multipart/form-data`, make sure the Request object has `formData` attached to the `body` property.

Well basically, you just need to create a fake request and pass it to the route.

```ts
import { Switchblade } from "@takodotid/switchblade";
import assert from "node:assert";
import { describe, it } from "node:test";

const app = new Switchblade().get("/hello/:name", (req, res) => {
    const name = req.params.name;
    res.send(`Hello ${name}!`);
});

describe("Switchblade Example API", () => {
    it("GET /users", async () => {
        const route = mainApp.getRoute("GET", "/hello/:name");
        if (!route) throw new Error("Route not found");

        const name = "John Doe";
        const request = new Request(`http://localhost/hello/${name}`);

        const response = await route.run(request, {
            name: encodeURIComponent(name),
        });

        assert.strictEqual(response.status, 200);
        assert.strictEqual(await response.text(), `Hello ${name}!`);
    });
});
```
