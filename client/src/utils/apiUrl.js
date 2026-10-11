const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

/**
 * Normalize the configured API origin/base URL so both
 * https://api.example.com and https://api.example.com/api work.
 */
export const getApiBaseUrl = () => {
  if (configuredApiUrl) {
    return /\/api$/i.test(configuredApiUrl)
      ? configuredApiUrl
      : `${configuredApiUrl}/api`;
  }

  return import.meta.env.DEV ? "http://localhost:5000/api" : "";
};

