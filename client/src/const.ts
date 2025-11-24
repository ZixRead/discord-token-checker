export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Discord Token Checker";

export const APP_LOGO = "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

/**
 * Google AdSense Configuration
 */
export const GOOGLE_ADSENSE_CLIENT_ID = "ca-pub-6484703241838115";

/**
 * reCAPTCHA v3 Configuration
 */
export const RECAPTCHA_SITE_KEY = "6LeOBBYsAAAAAAfflGvY5oj5MvNecZ4l5_9wRZQl";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
