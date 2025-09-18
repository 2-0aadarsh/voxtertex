import 'dotenv/config';

const isProd = process.env.NODE_ENV === "production";

/**
 * Cookie configuration for different environments
 */
const getCookieConfig = (maxAge) => ({
  httpOnly: true,
  secure: false, // Set to isProd in production
  sameSite: "lax", // Set to isProd ? "none" : "lax" in production
  maxAge,
  path: '/',
  // domain: isProd ? process.env.COOKIE_DOMAIN : undefined
});

/**
 * Set refresh token cookie (7 days)
 */
export const setRefreshTokenCookie = (res, token) => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  res.cookie("refreshToken", token, getCookieConfig(maxAge));
};

/**
 * Set access token cookie (15 minutes)
 */
export const setAccessTokenCookie = (res, token) => {
  const maxAge = 15 * 60 * 1000; // 15 minutes
  res.cookie("accessToken", token, getCookieConfig(maxAge));
};

/**
 * Set user role cookie (non-httpOnly for client access)
 */
export const setUserRoleCookie = (res, role) => {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  res.cookie("userRole", role, {
    httpOnly: false, // Allow client-side access
    secure: false, // Set to isProd in production
    sameSite: "lax", // Set to isProd ? "none" : "lax" in production
    maxAge,
    path: '/',
  });
};

/**
 * Set both tokens at once
 */
export const setAuthCookies = (res, tokens) => {
  setAccessTokenCookie(res, tokens.accessToken);
  setRefreshTokenCookie(res, tokens.refreshToken);
};

/**
 * Set all authentication cookies including user role
 */
export const setAllAuthCookies = (res, tokens, user) => {
  setAccessTokenCookie(res, tokens.accessToken);
  setRefreshTokenCookie(res, tokens.refreshToken);
  if (user && user.role) {
    setUserRoleCookie(res, user.role);
  }
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res) => {
  console.log('🍪 Starting to clear authentication cookies...');
  
  const clearConfig = {
    httpOnly: true,
    secure: false, // Set to isProd in production
    sameSite: "lax", // Set to isProd ? "none" : "lax" in production
    path: '/',
    // domain: isProd ? process.env.COOKIE_DOMAIN : undefined
  };
  
  // Clear backend cookies
  console.log('🍪 Clearing backend cookies: accessToken, refreshToken');
  res.clearCookie("accessToken", clearConfig);
  res.clearCookie("refreshToken", clearConfig);
  
  // Clear frontend cookies (non-httpOnly)
  const frontendClearConfig = {
    secure: false,
    sameSite: "lax",
    path: '/',
  };
  
  console.log('🍪 Clearing frontend cookies: token, userRole');
  res.clearCookie("token", frontendClearConfig);
  res.clearCookie("userRole", frontendClearConfig);
  
  console.log('✅ All authentication cookies cleared');
};

/**
 * Set user preference cookie (non-httpOnly for client access)
 */
export const setUserPreferenceCookie = (res, preferences) => {
  res.cookie("userPreferences", JSON.stringify(preferences), {
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/'
  });
};

/**
 * Set theme cookie
 */
export const setThemeCookie = (res, theme) => {
  res.cookie("theme", theme, {
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    path: '/'
  });
};

// Legacy functions for backward compatibility
export const setAuthRefreshCookie = setRefreshTokenCookie;
export const setAuthAccessCookie = setAccessTokenCookie;