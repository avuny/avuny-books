import AsyncStorage from "@react-native-async-storage/async-storage"

const ORGANIZATION_KEY =
  "selectedOrganizationId"

const LANGUAGE_KEY = "locale"

export const appStorage = {
  async getOrganizationId() {
    return AsyncStorage.getItem(
      ORGANIZATION_KEY
    )
  },

  async setOrganizationId(id: string) {
    return AsyncStorage.setItem(
      ORGANIZATION_KEY,
      id
    )
  },

  async getLanguage() {
    return AsyncStorage.getItem(
      LANGUAGE_KEY
    )
  },

  async setLanguage(language: string) {
    return AsyncStorage.setItem(
      LANGUAGE_KEY,
      language
    )
  },
}
