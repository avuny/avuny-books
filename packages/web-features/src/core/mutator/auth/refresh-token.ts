// Web refresh: POST /api/auth/refresh with the HttpOnly cookie.
// D5: cookie only, no refresh token in the body; x-requested-with is required.

import Axios from "axios"
import { API_CONFIG } from "../config"
import { tokenStorage } from "./token-storage"
import { refreshQueue } from "./refresh-queue"

type RefreshTokens = {
  accessToken: string
  accessTokenExpiresAt: string
}

function readTokens(payload: unknown): RefreshTokens {
  const root = payload as {
    data?: { tokens?: RefreshTokens }
    tokens?: RefreshTokens
  }
  const tokens = root?.data?.tokens ?? root?.tokens
  if (!tokens?.accessToken || !tokens.accessTokenExpiresAt) {
    throw new Error("Refresh response did not include an access token")
  }
  return tokens
}

export async function refreshAccessToken(): Promise<string> {
  const response = await Axios.post(
    API_CONFIG.refreshTokenUrl,
    {},
    {
      withCredentials: true,
      headers: {
        [API_CONFIG.headers.xRequestedWith]:
          API_CONFIG.headers.xRequestedWithValue,
      },
    }
  )

  const { accessToken, accessTokenExpiresAt } = readTokens(response.data)
  tokenStorage.setAccessToken(accessToken, accessTokenExpiresAt)
  return accessToken
}

export function refreshAccessTokenSingleFlight(): Promise<string> {
  return refreshQueue.run(() => refreshAccessToken())
}
