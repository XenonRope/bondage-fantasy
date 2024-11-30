import { en } from "./translations/en";
import { pl } from "./translations/pl";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: { en, pl },
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
