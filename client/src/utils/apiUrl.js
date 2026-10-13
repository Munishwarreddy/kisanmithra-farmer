const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
const productionApiUrl = "https://kisanmithra-farmer-1.onrender.com/api";
const isLoopbackApiUrl = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?(?:\/|$)/i.test(configuredApiUrl || "");

/**
 * Normalize the configured API origin/base URL so both
 * https://api.example.com and https://api.example.com/api work.
 */
export const getApiBaseUrl = () => {
  if (configuredApiUrl && (import.meta.env.DEV || !isLoopbackApiUrl)) {
    return /\/api$/i.test(configuredApiUrl)
      ? configuredApiUrl
      : `${configuredApiUrl}/api`;
  }

  return import.meta.env.DEV ? "http://localhost:5000/api" : productionApiUrl;
};

