import * as SecureStore from "expo-secure-store"

const ACCESS_TOKEN_KEY = "accessToken"

export const tokenStorage = {
  async getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
  },

  async setAccessToken(token: string) {
    return SecureStore.setItemAsync(
      ACCESS_TOKEN_KEY,
      token
    )
  },

  async removeAccessToken() {
    return SecureStore.deleteItemAsync(
      ACCESS_TOKEN_KEY
    )
  },
}
