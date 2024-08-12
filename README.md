# quick-response

API response message for any Node JS application

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![API](https://img.shields.io/badge/API-FF6F61?style=for-the-badge&logo=api&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## Installation

Install the package in your project

```bash
npm quick-response
```

## Usage

The package provides a utility function called `apiResponse` that allows you to create API response objects

The `apiResponse` function accepts the following parameters:

<b>statusCode (number)</b>:

- The HTTP status code to be returned with the response.
- Example values: 200 (OK), 404 (Not Found), 500 (Internal Server Error).

<b>message (string)</b>:

- A brief message describing the response.
- Example values: 'Success', 'Resource not found', 'Internal server error'.

<b>data (object, optional)</b>:

- An optional object containing additional data to be included in the response.
- If not provided, the data field in the response will be set to null.
- Example value: { id: 1, name: 'John Doe' }.

1. If you are using common js

```javascript
const apiResponse = require("quick-response");
console.log(apiResponse(200, "Success", { id: 1 }));
```

2. If you are using module js

```javascript
import apiResponse from "quick-response";
console.log(apiResponse(200, "Success", { id: 1 }));
```

## Usage with Express

```javascript
import express from "express";
import apiResponse from "apiResponse";

const app = express();
const port = 8000;

app.get("/", (req, res) => {
  res.json(apiResponse(201, "User Created", { id: 1, name: "John Doe" }));
});

app.listen(port, () => console.log("Server is running"));
```

Happy Coding...👍

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
