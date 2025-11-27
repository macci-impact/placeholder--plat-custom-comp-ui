export const responseCheck = (response)  => {
    if (response.status === 200) {
        return response.json();
    } else if (response.status === 401 || response.status === 403) {
        if (window.uitkSessionExpiredPop) {
            window.uitkSessionExpiredPop('/login.user', response.status);
        } else {
            window.location.href = '/login.user';
        }
    } else if (response.status === 400) {
        response.json().then(json => {
            console.warn('requested page not found:', json);
        });
    }
    return undefined;
};

export const isValidHexColor = (color) => {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
};

const RTL_LANGUAGES = ["he", "ar"]
export const isRTL = (lang) => {
    return RTL_LANGUAGES.includes(lang);
};

export const parseJwt = (token) => {
    if (!token) {
        throw new Error("Invalid token");
    }

    const base64Url = token.split(".")[1];
    if (!base64Url) {
        throw new Error("Invalid JWT format");
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
    );

    return JSON.parse(jsonPayload);
}

export function observeLangAttribute(callback) {
    const htmlEl = document.querySelector("html");

    const lang = htmlEl?.getAttribute("lang") || "en_US";
    callback(lang);

    const observer = new MutationObserver(() => {
        const lang = htmlEl?.getAttribute("lang") || "en_US";
        callback(lang);
    });

    observer.observe(htmlEl, {
        attributes: true,
        attributeFilter: ["lang"], // only watch 'lang'
    });

    return observer;
}
