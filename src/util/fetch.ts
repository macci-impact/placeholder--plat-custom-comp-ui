declare global {
  interface Window {
    getCsrfToken: () => string;
  }
}

export async function fetchJson(endpoint: string) {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
      headers: {
        "is-Ajax-Request": "true",
        uitk_csrf: window.getCsrfToken(),
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Response from ${endpoint} was not ok`, response);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType?.includes("application/json")) {
      throw new TypeError("Response wasn't JSON");
    }

    return await response.json();
  } catch (err) {
    console.log(err);
  }
}
