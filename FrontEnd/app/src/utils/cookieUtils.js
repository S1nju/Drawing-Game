// Cookie utilities for user management

export const setCookie = (name, value, days = 7) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
};

export const getCookie = (name) => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }
    return null;
};

export const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

export const getUserFromCookie = () => {
    const username = getCookie('drawingGame_user');
    const userId = getCookie('drawingGame_userId');
    if (username && userId) {
        return { username, userId };
    }
    return null;
};

export const saveUserToCookie = (username, userId) => {
    setCookie('drawingGame_user', username, 30);
    setCookie('drawingGame_userId', userId, 30);
};
