/**
 * @typedef {Object} HttpClient
 * @property {function(string, Object=): Promise<*>} get
 * @property {function(string, *=, Object=): Promise<*>} post
 */

/** @type {HttpClient | undefined} */
let __api_axios_instance__;

export const ApiCentralConfig = {

    /** @param {HttpClient} instance */
    setAxiosInstance: (instance) => {

        if (!instance || typeof instance.get !== 'function' || typeof instance.post !== 'function') {

            throw new TypeError('API Central requires an Axios instance with get() and post() methods.');

        }

        return __api_axios_instance__ = instance;

    },

};

const getAxiosInstance = () => {

    if (!__api_axios_instance__) {

        throw new Error('Configure API Central with ApiCentralConfig.setAxiosInstance(instance) before making requests.');

    }

    return __api_axios_instance__;

};

/**
 * Append own enumerable parameters without changing an existing query or fragment.
 *
 * @param {string} apiAction
 * @param {Object} [params]
 * @returns {string}
 */
export const apiUrl = (apiAction, params = {}) => {

    const query = Object.entries(params ?? {})
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    if (!query) return apiAction;

    const hashIndex = apiAction.indexOf('#');

    const url = hashIndex < 0 ? apiAction : apiAction.slice(0, hashIndex);

    const fragment = hashIndex < 0 ? '' : apiAction.slice(hashIndex);

    const separator = url.includes('?') ? (/[?&]$/.test(url) ? '' : '&') : '?';

    return url + separator + query + fragment;

};

/**
 * Prepare a flat, URL-encoded request body.
 *
 * @param {Object} [params]
 * @returns {URLSearchParams}
 */
export const prepareUrlParams = (params = {}) => {

    const usp = new URLSearchParams();

    for (const [key, value] of Object.entries(params ?? {})) {

        usp.append(key, value);

    }

    return usp;

};

/**
 * Prepare multipart data, preserving native File names.
 *
 * @param {Object} [params]
 * @returns {FormData}
 */
export const prepareFormData = (params = {}) => prepareFormDataWithBlob(params);

/**
 * Optional filenames correspond to Blob/File values in property order.
 * Omitted filenames retain a File's name or the native Blob default.
 *
 * @param {Object} [params]
 * @param {Array<string>} [fnList]
 * @returns {FormData}
 */
export const prepareFormDataWithBlob = (params = {}, fnList = []) => {

    const formData = new FormData();

    let blobN = 0;

    for (const [key, value] of Object.entries(params ?? {})) {

        const filename = typeof Blob !== 'undefined' && value instanceof Blob ? fnList?.[blobN++] : undefined;

        if (filename == null) {

            formData.append(key, value);

        } else {

            formData.append(key, value, filename);

        }

    }

    return formData;

};

/**
 * GET with the existing API Central query serialization.
 *
 * @param {string} url
 * @param {Object} [params]
 * @param {Object} [config] Axios request config, passed through unchanged.
 * @returns {Promise<*>} The original Axios promise and full response.
 */
export const apiCall = (url, params = {}, config) => {

    return getAxiosInstance().get(apiUrl(url, params), config);

};

/**
 * POST a flat, URL-encoded body.
 *
 * @param {string} url
 * @param {Object} [params]
 * @param {Object} [config] Axios request config.
 * @returns {Promise<*>}
 */
export const apiCallPost = (url, params = {}, config) => {

    return getAxiosInstance().post(url, prepareUrlParams(params), config);

};

/**
 * POST multipart data; let Axios and the runtime set the boundary.
 *
 * @param {string} url
 * @param {Object} [params]
 * @param {Object} [config] Axios request config.
 * @returns {Promise<*>}
 */
export const apiCallFormData = (url, params = {}, config) => {

    return getAxiosInstance().post(url, prepareFormData(params), config);

};

/**
 * POST multipart data with optional Blob/File filenames.
 *
 * @param {string} url
 * @param {Object} [params]
 * @param {Array<string>} [fnList]
 * @param {Object} [config] Axios request config.
 * @returns {Promise<*>}
 */
export const apiCallFormDataWithBlob = (url, params = {}, fnList = [], config) => {

    return getAxiosInstance().post(url, prepareFormDataWithBlob(params, fnList), config);

};

/**
 * POST an already prepared body (for example, an object for JSON or FormData).
 *
 * @param {string} url
 * @param {*} [params]
 * @param {Object} [config] Axios request config.
 * @returns {Promise<*>}
 */
export const apiSubmitFormPost = (url, params, config) => {

    return getAxiosInstance().post(url, params, config);

};
