import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

// Strapi v5 server base URL. NEXT_PUBLIC_ because the axios instances may
// also be bundled into client code (for reads of public content only).
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Full-access Strapi v5 API token. SERVER-ONLY: never prefix it with
// NEXT_PUBLIC_ or the secret would be shipped to the browser.
const API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!API_URL) {
    throw new Error(
        'NEXT_PUBLIC_API_URL is not defined. Copy .env.local.example to .env.local and set the Strapi server URL.',
    );
}

// Normalize trailing slashes so the /api path never double-slashes.
const baseURL = `${API_URL.replace(/\/+$/, '')}/api`;

/**
 * Request interceptor: attaches the Strapi bearer token when one is
 * configured. On the server every request goes out authenticated; in the
 * browser API_TOKEN is undefined, so only public content is readable there.
 */
function attachToken(config: InternalAxiosRequestConfig) {
    if (API_TOKEN && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${API_TOKEN}`;
    }
    return config;
}

/** Adds the Strapi bearer-token interceptor to an axios instance. */
function withStrapiAuth(instance: AxiosInstance): AxiosInstance {
    instance.interceptors.request.use(attachToken);
    return instance;
}

const api = {
    public: withStrapiAuth(axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    })),
    upload: withStrapiAuth(axios.create({
        baseURL,
        // No Content-Type — let axios auto-set the multipart boundary from FormData
    })),
}

export default api;