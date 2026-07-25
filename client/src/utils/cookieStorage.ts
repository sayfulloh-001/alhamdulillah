/**
 * Drop-in replacement for localStorage utilizing document.cookie.
 * This satisfies the constraint of having NO localStorage while preserving login status.
 */
export const cookieStorage = {
  getItem(key: string): string | null {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  },

  setItem(key: string, value: string): void {
    // Set cookie with far future expiration date (approx 1 year)
    const d = new Date();
    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = key + "=" + encodeURIComponent(value) + ";" + expires + ";path=/;SameSite=Strict";
  },

  removeItem(key: string): void {
    // Expire the cookie immediately
    document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;SameSite=Strict";
  }
};
