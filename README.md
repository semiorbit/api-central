# Semiorbit API Central

A small Axios wrapper with URL, URL-encoded body, and multipart helpers.

One implementation file, no runtime dependencies. Your application creates and configures Axios; API Central uses the instance you provide.

## Installation

```powershell
npm install axios @semiorbit/api-central
```

## Configuration

Configure API Central once during application startup, before making requests.

```javascript
import axios from 'axios';

import {ApiCentralConfig} from '@semiorbit/api-central';

const instance = axios.create({

    baseURL: 'https://api.example.com/en/',

});

ApiCentralConfig.setAxiosInstance(instance);

export default instance;
```

Authentication, language, application context, interceptors, and Axios defaults belong in the application's Axios configuration.

API Central returns the original Axios promise. Callers receive the full response, including `data`, `status`, and `headers`; rejected requests keep their original Axios error.

## Functions

All existing function names and argument lists remain available. Each request helper now accepts an optional final Axios configuration argument.

| Function | Purpose |
| --- | --- |
| `apiUrl(url, params = {})` | Append encoded parameters before a URL fragment, preserving existing query strings. |
| `prepareUrlParams(params = {})` | Create a URLSearchParams body. |
| `prepareFormData(params = {})` | Create FormData, retaining native File names. |
| `prepareFormDataWithBlob(params = {}, fnList = [])` | Create FormData with optional Blob/File filenames. |
| `apiCall(url, params = {}, config)` | GET with API Central query encoding. |
| `apiCallPost(url, params = {}, config)` | POST a URL-encoded body. |
| `apiCallFormData(url, params = {}, config)` | POST multipart data. |
| `apiCallFormDataWithBlob(url, params = {}, fnList = [], config)` | POST multipart data with optional filenames. |
| `apiSubmitFormPost(url, body, config)` | POST the supplied body without preparing it. |

An unconfigured client produces a clear error. `setAxiosInstance()` requires an instance exposing both `get()` and `post()`.

## URL-encoded POST

```javascript
import {apiCallPost} from '@semiorbit/api-central';

const response = await apiCallPost('/auth', {

    identity: 'user@example.com',

    password: 'exact password value',

});

console.log(response.data);
```

Values are sent as supplied, without trimming or validation.

## Cancellation and request settings

The final `config` argument is passed directly to Axios. It can contain `signal`, `timeout`, `headers`, `onUploadProgress`, `responseType`, or other supported Axios settings.

```javascript
import {apiCall} from '@semiorbit/api-central';

const controller = new AbortController();

const request = apiCall('/items?active=1', {page: 2}, {

    signal: controller.signal,

    timeout: 10000,

});

// Call when this request is no longer needed:

controller.abort();
```

GET parameters keep API Central's original flat encoding. Additional `config.params` are handled by Axios itself, using its own serialization rules.

## Multipart uploads

```javascript
import {apiCallFormDataWithBlob} from '@semiorbit/api-central';

const response = await apiCallFormDataWithBlob('/upload', {

    title: 'Report',

    attachment: new Blob(['Report contents'], {type: 'text/plain'}),

}, ['report.txt'], {

    onUploadProgress: (event) => console.log(event.loaded),

});
```

Filename entries correspond only to Blob/File values, in property order. Omitted or null filename entries preserve the File's existing name or the runtime's default Blob name. To supply config without custom filenames, pass `undefined` as the third argument.

Do not manually set multipart `Content-Type` in a browser. Axios and the runtime supply the correct boundary.

For native FormData uploads in Node.js, use Axios's default HTTP adapter. In testing with Axios 1.20.0, its Node fetch adapter incorrectly supplied a URL-encoded content type when no multipart header was configured. This does not apply to the browser XHR and fetch adapters.

## Serialization compatibility

Helpers read only own enumerable string-keyed properties. Inherited properties are ignored; null-prototype objects are supported. Missing, null, or empty parameter objects produce empty bodies and leave URLs unchanged.

Individual values retain the original flat string conversion:

| Input value | Sent value |
| --- | --- |
| `0` | `"0"` |
| `false` | `"false"` |
| `null` | `"null"` |
| `undefined` | `"undefined"` |
| `['a', 'b']` | `"a,b"` |
| `{a: 1}` | `"[object Object]"` |

File and Blob values remain binary in FormData. For nested JSON, use `apiSubmitFormPost(url, object, config)` with your application's usual Axios configuration. For JSON stored in a form field, explicitly use `JSON.stringify(value)`. Omit properties you do not want to send.

## Version 1.1.0

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

Run the focused regression tests with Node.js 22 or later:

```powershell
npm test
```

Tests use Node's built-in test runner and require no additional packages.
