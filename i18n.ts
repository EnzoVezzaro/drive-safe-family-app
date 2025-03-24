import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

// Import translations
import en from './locales/en.json';
import es from './locales/es.json';

// Detect language from device settings
const getDeviceLanguage = () => {
  const locales = RNLocalize.getLocales();
  return locales.length > 0 ? locales[0].languageTag : 'en';
};

i18next
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: 'es', // Default language from device
    fallbackLng: 'en', // Fallback language
    interpolation: { escapeValue: false },
  });

export default i18next;
