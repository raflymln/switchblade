# SBRequest

`SBRequest` is a custom class that is passed as `req` to the request handler function.

::: warning
This class is NOT extending the [Web Standard Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) class, use `req.raw` to access the raw request object.
:::

## .app

The Switchblade instance.

## .raw

The original request in Web Standard Request object.

## .validationSchema

The validation schema used to validate the request.

- `.validationSchema.query`: Validation schema for query parameters.
- `.validationSchema.body`: Validation schema for request body.
- `.validationSchema.params`: Validation schema for request parameters.
- `.validationSchema.headers`: Validation schema for request headers.
- `.validationSchema.cookies`: Validation schema for request cookies.

## .state

The custom state object that can be used to store data between middlewares and request handlers.

```typescript
new Switchblade()
    .use((req, res, next) => {
        req.state.customData = "Hello, world!";
        next();
    })
    .get("/example", (req, res) => {
        res.send(req.state.customData); // 'Hello, world!'
    });
```

## .params

The request parameters in a key-value object.

## .query

The query parameters in a key-value object.

## .headers

The request headers in a key-value object.

## .cookies

The request cookies in a key-value object.

## .method

The HTTP method of the request (GET, POST, PUT, DELETE, etc.).

## .url

The URL of the request in [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) object.

## .contentType

The content type of the request.

::: info
For content type like `multipart/form-data`, it contains a boundary, for example it looks like this:

```shell
Content-Type: multipart/form-data; boundary=---WebKitFormBoundary7MA4YWxkTrZu0gW ...
```

So we only took the front part of the value which is `multipart/form-data` and ignore the rest
:::

## .json()

Parse the request body as JSON, if validation schema is provided, it will validate the request body against the schema. See [Validation](validation.md#request-validation) for more information.

## .text()

Get the request body as text. (Not validated with schema)

## .formData()

Get the request body as form data. (Not validated with schema)

## .blob()

Get the request body as a blob. (Not validated with schema)

## .arrayBuffer()

Get the request body as an array buffer. (Not validated with schema)
