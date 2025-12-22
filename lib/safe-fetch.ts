/**
 * A wrapper around fetch that falls back to XMLHttpRequest if fetch fails.
 * This is useful when browser extensions intercept and break fetch requests.
 */
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        console.warn('Fetch failed, falling back to XHR:', error);
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(options.method || 'GET', url);

            // Set headers
            if (options.headers) {
                const headers = new Headers(options.headers);
                headers.forEach((value, key) => {
                    xhr.setRequestHeader(key, value);
                });
            }

            // Handle response
            xhr.onload = () => {
                const headers = new Headers();
                const headerLines = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
                headerLines.forEach((line) => {
                    const parts = line.split(': ');
                    const key = parts.shift();
                    const value = parts.join(': ');
                    if (key) headers.append(key, value);
                });

                resolve(new Response(xhr.response, {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: headers,
                }));
            };

            xhr.onerror = () => {
                reject(new TypeError('Network request failed'));
            };

            // Send body
            if (options.body) {
                xhr.send(options.body as any);
            } else {
                xhr.send();
            }
        });
    }
}
