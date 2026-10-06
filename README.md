# Semiorbit API Central

A small Axios wrapper with helpers for URLs, URL-encoded bodies, and multipart uploads.

One implementation file, no runtime dependencies. Your application creates and configures Axios; API Central uses the instance you provide.

## Installation

```powershell
npm install axios @semiorbit/api-central
```

## Configure once

Create your application's Axios instance, then give it to API Central. For example, in `src/axios.js`:

```javascript
import axios from 'axios';

import {ApiCentralConfig} from '@semiorbit/api-central';

const instance = axios.create({

    baseURL: 'https://api.example.com/en/',

});

ApiCentralConfig.setAxiosInstance(instance);

export default instance;
```

Import that configuration once from your application's entry file, before making requests:

```javascript
import './axios.js';
```

The request examples below assume this configuration has already run. Example endpoints such as `/items` and `/upload` stand for routes provided by your own API.

Authentication, language, application context, interceptors, and Axios defaults belong in the application's Axios configuration.

API Central returns the original Axios promise. Callers receive the full response, including `data`, `status`, and `headers`; rejected requests keep their original Axios error.

## Choose the function

The preparation helpers create a URL or body. The request helpers send it.

| Function | Input | Result |
| --- | --- | --- |
| `apiUrl(url, params)` | URL and a plain parameter object | URL string; no request |
| `prepareUrlParams(params)` | Plain parameter object | URLSearchParams; no request |
| `prepareFormData(params)` | Plain object containing text, File, or Blob values | FormData; no request |
| `prepareFormDataWithBlob(params, fnList)` | Plain object and optional filenames | FormData; no request |
| `apiCall(url, params, config)` | URL parameters | GET request |
| `apiCallPost(url, params, config)` | Plain parameter object | URL-encoded POST request |
| `apiCallFormData(url, params, config)` | Plain object containing form values | Multipart POST request |
| `apiCallFormDataWithBlob(url, params, fnList, config)` | Plain object and optional filenames | Multipart POST request |
| `apiSubmitFormPost(url, body, config)` | An already prepared body, or a JSON object | POST request with the supplied body |

Each request helper accepts an optional final Axios configuration argument.

Missing parameters default to an empty object in the preparation helpers, `apiCall`, `apiCallPost`, and the two multipart request helpers. The filename list is also optional.

An unconfigured client produces a clear error. `setAxiosInstance()` requires an instance exposing both `get()` and `post()`.

## 1. apiUrl: prepare a URL

Append encoded parameters to a URL. Existing query parameters and the fragment are preserved.

```javascript
import {apiUrl} from '@semiorbit/api-central';

const url = apiUrl('/items?active=1#results', {

    page: 2,

    search: 'blood test',

});

console.log(url);

// /items?active=1&page=2&search=blood%20test#results

console.log(apiUrl('/items'));

// /items
```

This function only returns a string. Use `apiCall` when you want API Central to perform the GET request.

## 2. prepareUrlParams: prepare a URL-encoded body

Create a URLSearchParams body from a flat object. This is useful when you need to prepare the body separately from sending it.

```javascript
import {prepareUrlParams} from '@semiorbit/api-central';

const body = prepareUrlParams({

    identity: 'user+one@example.com',

    password: 'sample password',

});

console.log(body.get('identity'));

// user+one@example.com

console.log(body.toString());

// identity=user%2Bone%40example.com&password=sample+password
```

This prepares the body without sending it. `apiCallPost` combines preparation and submission in one call.

## 3. prepareFormData: prepare a multipart body

Create FormData from a plain object. Text remains text; File and Blob values remain binary.

```javascript
import {prepareFormData} from '@semiorbit/api-central';

const file = new File(['Report contents'], 'report.txt', {

    type: 'text/plain',

});

const body = prepareFormData({

    title: 'Lab report',

    attachment: file,

});

console.log(body.get('title'));

// Lab report

console.log(body.get('attachment').name);

// report.txt
```

The File keeps its original filename. You now have a prepared FormData body; `apiSubmitFormPost` can send it.

For a browser file picker, the selected File is available through `input.files[0]`.

## 4. prepareFormDataWithBlob: prepare a body with a Blob filename

A Blob contains binary data but does not carry a File's filename. Supply the name you want the API to receive.

```javascript
import {prepareFormDataWithBlob} from '@semiorbit/api-central';

const report = new Blob(['Report contents'], {

    type: 'text/plain',

});

const body = prepareFormDataWithBlob({

    title: 'Generated report',

    attachment: report,

}, ['report.txt']);

console.log(body.get('attachment').name);

// report.txt
```

The filename list follows only the Blob/File values, in property order. Text fields do not consume filenames.

For example, `{title: 'Report', first: blobA, note: 'Ready', second: blobB}` with `['first.txt', 'second.txt']` names those two binary fields in that order.

Omitted or null filename entries preserve a File's existing name or the runtime's default Blob name.

## 5. apiCall: send a GET request

Provide a URL and a plain object of query parameters.

```javascript
import {apiCall} from '@semiorbit/api-central';

const response = await apiCall('/items?active=1', {

    page: 2,

    search: 'blood test',

});

console.log(response.data);

console.log(response.status);
```

API Central prepares `/items?active=1&page=2&search=blood%20test` and sends a GET request through your configured Axios instance.

To send no additional query parameters, use `apiCall('/items')`.

## 6. apiCallPost: send a URL-encoded POST

Use this for an API expecting a flat, URL-encoded body, such as a login endpoint.

```javascript
import {apiCallPost} from '@semiorbit/api-central';

const response = await apiCallPost('/auth', {

    identity: 'user@example.com',

    password: 'sample password',

});

console.log(response.data);
```

API Central creates URLSearchParams and posts it. With Axios's usual settings, the request uses `application/x-www-form-urlencoded`.

Values are sent as supplied, without trimming or validation. Validation belongs in your form or business logic.

## 7. apiCallFormData: prepare and send multipart data

Provide a plain object. API Central creates FormData and submits it.

```javascript
import {apiCallFormData} from '@semiorbit/api-central';

const file = new File(['Report contents'], 'report.txt', {

    type: 'text/plain',

});

const response = await apiCallFormData('/upload', {

    title: 'Lab report',

    attachment: file,

});

console.log(response.data);
```

The API receives a text field named `title` and a file field named `attachment`, with the filename `report.txt`.

## 8. apiCallFormDataWithBlob: send a Blob with a filename

Provide the plain object first, the filename list next, and optional Axios settings last.

```javascript
import {apiCallFormDataWithBlob} from '@semiorbit/api-central';

const report = new Blob(['Report contents'], {

    type: 'text/plain',

});

const response = await apiCallFormDataWithBlob('/upload', {

    title: 'Generated report',

    attachment: report,

}, ['report.txt'], {

    onUploadProgress: (event) => console.log(event.loaded),

});

console.log(response.data);
```

This sends the Blob as `report.txt`. The progress callback reports uploaded bytes.

To provide settings while keeping native filenames, pass `undefined` for the filename list:

```javascript
import {apiCallFormDataWithBlob} from '@semiorbit/api-central';

const file = new File(['Report contents'], 'original.txt');

const response = await apiCallFormDataWithBlob('/upload', {

    attachment: file,

}, undefined, {

    timeout: 10000,

});

console.log(response.data);
```

## 9. apiSubmitFormPost: submit the body you already have

This function passes its second argument directly to `instance.post(url, body, config)`.

It does not read HTML inputs, build FormData, or validate fields. You supply the body, and Axios handles the request.

### Example A: send an already prepared FormData body

```javascript
import {prepareFormData, apiSubmitFormPost} from '@semiorbit/api-central';

const body = prepareFormData({

    title: 'Lab report',

    attachment: new File(['Report contents'], 'report.txt'),

});

const response = await apiSubmitFormPost('/upload', body);

console.log(response.data);
```

These two approaches send equivalent multipart data:

| What you have | What to call |
| --- | --- |
| Plain object of form values | `apiCallFormData('/upload', values)` |
| Prepared FormData body | `apiSubmitFormPost('/upload', body)` |

Use `apiSubmitFormPost` for a FormData instance you created yourself, including one created from an HTML form.

### Example B: send a JSON object

With Axios's usual configuration, a plain object passed directly to this function is sent as JSON. This supports nested objects and arrays.

```javascript
import {apiSubmitFormPost} from '@semiorbit/api-central';

const response = await apiSubmitFormPost('/orders', {

    customer: {

        id: '123',

        name: 'Example customer',

    },

    items: [

        {product_id: '456', quantity: 2},

    ],

});

console.log(response.data);
```

This differs from `apiCallPost`, which converts a flat object into a URL-encoded body.

### Example C: submit a complete HTML form

In a bundled browser app such as Vite, put this form in your page. The JavaScript example below lives in `src/upload-example.js`.

```html
<form id="upload-form">

    <label for="report-title">Title</label>

    <input id="report-title" name="title" type="text" required>

    <label for="report-file">Attachment</label>

    <input id="report-file" name="attachment" type="file" required>

    <button type="submit">Upload</button>

</form>

<p id="upload-result" role="status"></p>

<script type="module" src="/src/upload-example.js"></script>
```

Configure Axios as shown earlier, then read the form's values with `new FormData(form)` and submit that body:

```javascript
import './axios.js';

import {apiSubmitFormPost} from '@semiorbit/api-central';

const form = document.getElementById('upload-form');

const result = document.getElementById('upload-result');

form.addEventListener('submit', async (event) => {

    event.preventDefault();

    const body = new FormData(event.currentTarget);

    result.textContent = 'Uploading...';

    try {

        const response = await apiSubmitFormPost('/upload', body);

        result.textContent = 'Uploaded successfully.';

        console.log(response.data);

    } catch (error) {

        result.textContent = 'Upload failed. Please try again.';

        console.error(error);

    }

});
```

The flow is: the user submits the form, JavaScript collects its fields into FormData, and API Central submits that body through Axios.

The `name` attributes become the API field names: `title` and `attachment`. FormData automatically includes the selected file and its filename. Disabled fields and controls without a `name` are omitted.

The browser performs the form's built-in required checks before a normal submit event. Add your own validation when your form needs more rules.

## Optional Axios settings

The final `config` argument goes directly to Axios. It can contain `signal`, `timeout`, `headers`, `onUploadProgress`, `responseType`, or other supported Axios settings.

For example, a GET request with a timeout and a custom header:

```javascript
import {apiCall} from '@semiorbit/api-central';

const response = await apiCall('/items', {}, {

    timeout: 10000,

    headers: {

        'X-Request-Source': 'web',

    },

});

console.log(response.data);
```

### Cancellation

Keep the AbortController where your application can call `abort()` when the request is no longer needed. This example cancels immediately to demonstrate the behavior:

```javascript
import {apiCall} from '@semiorbit/api-central';

const controller = new AbortController();

const request = apiCall('/items', {}, {

    signal: controller.signal,

});

controller.abort();

try {

    const response = await request;

    console.log(response.data);

} catch (error) {

    if (error.code === 'ERR_CANCELED') {

        console.log('Request cancelled.');

    } else {

        throw error;

    }

}
```

GET parameters keep API Central's original flat encoding. Additional `config.params` are handled by Axios itself, using its own serialization rules.

## Request errors

API Central keeps Axios's rejection behavior. Handle errors at the point where your application knows how to present them.

```javascript
import {apiCallPost} from '@semiorbit/api-central';

try {

    const response = await apiCallPost('/auth', {

        identity: 'user@example.com',

        password: 'sample password',

    });

    console.log(response.data);

} catch (error) {

    console.log(error.response?.status);

    console.log(error.response?.data);

}
```

An HTTP error response is available through `error.response`. Network errors may have no response, which is why the example uses optional chaining.

## Multipart headers

Do not manually set multipart `Content-Type` in a browser. Axios and the runtime supply the correct boundary.

For native FormData uploads in Node.js, use Axios's default HTTP adapter. In testing with Axios 1.20.0, its Node fetch adapter incorrectly supplied a URL-encoded content type when no multipart header was configured. This did not occur with the browser XHR and fetch adapters.

## Serialization compatibility

The preparation helpers read only own enumerable string-keyed properties. Inherited properties are ignored; null-prototype objects are supported. Missing, null, or empty parameter objects produce empty bodies and leave URLs unchanged.

Individual values retain the original flat string conversion:

| Input value | Sent value |
| --- | --- |
| `0` | `"0"` |
| `false` | `"false"` |
| `null` | `"null"` |
| `undefined` | `"undefined"` |
| `['a', 'b']` | `"a,b"` |
| `{a: 1}` | `"[object Object]"` |

File and Blob values remain binary in FormData.

For nested JSON, use `apiSubmitFormPost(url, object, config)` with your application's usual Axios configuration. For JSON stored in a form field, explicitly use `JSON.stringify(value)`. Omit properties you do not want to send.

## Version 1.1.1

- Existing function names, Axios injection, full responses, and rejected errors preserved.
- Existing URL queries and fragments handled correctly.
- Empty parameters supported.
- Own-property iteration used throughout.
- Optional Blob filenames and native File names supported.
- Automatic multipart boundary handling restored.
- Optional Axios request configuration added.
- Existing ES module source explicitly declared through `"type": "module"`.
- No runtime dependencies or build step added.

Named ESM imports remain the supported interface. No CommonJS bundle is provided.

## Development

With the supplied regression test file at `tests/api-central.test.js`, run the tests using Node.js 22 or later:

```powershell
npm test
```

Tests use Node's built-in test runner and require no additional packages.
