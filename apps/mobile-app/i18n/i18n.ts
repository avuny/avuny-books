import i18n from "i18next"
import ICU from "i18next-icu"
import { initReactI18next } from "react-i18next"
import * as Localization from "expo-localization"
import { type Locale } from "@avuny/i18n"
import { resources } from "./resources"

i18n
  .use(ICU)
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0]?.languageCode || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    defaultNS: "common",
    ns: ["common", "auth", "organization", "role"],

    compatibilityJSON: "v4",
    returnNull: false,
    keySeparator: ".",
  })

export default i18n
