const baseURL = process.env.EXPO_PUBLIC_BASEURL

if (!baseURL) {
  throw new Error(
    "EXPO_PUBLIC_BASEURL is missing from environment variables"
  )
}

export const API_CONFIG = {
  baseURL,

  refreshTokenUrl: `${baseURL}/api/auth/token/refresh`,

  auth: {
    refreshStatusCode: 401,
    refreshErrorCodes: ["UNAUTHENTICATED", "SERVER_ERROR"],
  },

  headers: {
    organizationId: "x-organization-id",
    language: "x-lang",
  },
}
