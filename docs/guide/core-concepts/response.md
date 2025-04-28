# SBResponse

`SBResponse` is a custom class that is passed as `res` to the request handler function.

::: info
By default, the status code is set to `200`, and the content type is set to `application/json`.
:::

::: danger
**DO NOT** return the route handler with Web Standard Response `new Response()`, instead using `res.createResponse()` instead. This is to make sure the middleware and route handler are binded to the same response object.

See the usage for `res.createResponse()` below.
:::

## .validationSchema

The validation schema for the response.

## .response

The binded response object, or `null` if not binded yet.

## .status(code: number)

Set the status code of the response.

## .setContentType(type: string, charset?: string)

Set the content type of the response.

## .setHeader(name: string, value: string)

Set a header for the response.

::: tip
To set the content type, use `.setContentType` instead to make sure the Typescript type is correct.
:::

## .setCookie(name: string, value: string, options?: CookieOptions)

Set a cookie for the response. For `options`, see the [Serialize Options](https://github.com/jshttp/cookie?tab=readme-ov-file#cookieserializename-value-options)

You can use this method multiple times as it'll append the `Set-Cookie` header into the response headers.

## .removeCookie(name: string, options?: SerializeOptions)

Remove a cookie from the response. For `options`, see the [Serialize Options](https://github.com/jshttp/cookie?tab=readme-ov-file#cookieserializename-value-options) (only `path`, `secure`, and `domain` are supported).

::: warning
This method will not remove the previous set cookie using `.setCookie` method, instead it will make the cookie invalid/instantly expired by setting the `expires` and `max-age` to `0`.
:::

## .createResponse(body?: BodyInit, init?: ResponseInit)

It's a wrapper for the [Web Standard Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) constructor, but it will also bind the response to the `.response` property.

## .redirect(url: string)

Redirect the response to the given URL.

::: warning
Make sure you have set the status code to `3xx` before calling this method. See [Redirect Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#redirection_messages) for more information.
:::

## .end()

End the response. This will send an empty `new Response()` in behind the scenes.

::: warning
If you intended to send an empty response, it's recommended to set the status code to `204` first.
:::

## .send(data: any)

Send the data to the response. The `data` will infer its type from the status code and content type. To make it type-safe, make sure you call it after setting the status code and content type.

Types is inferred from the `responses` validation option on the route, see [Response Validation](validation.md#response-validation) for more information.

::: warning
This will validate the data first (if schema is provided) and then stringify the `data` (only if it's not yet a string).
:::

```typescript
// This will infer the `data` type from Responses[200]['content']['application/json']
res.status(200).setContentType("application/json").send({
    message: "Hello World",
});
```

## .json(data: any)

It uses `.send` under the hood, but it will set the content type to `application/json`.

```typescript
// You don't need to set the content type to `application/json` manually,
// it will automatically infer the data from Responses[200]['content']['application/json']
res.status(200).json({
    message: "Hello World",
});
```

## .text(data: string)

Same like `.json`, but it will set the content type to `text/plain`.

## .html(data: string)

Same like `.json`, but it will set the content type to `text/html`.
