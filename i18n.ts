import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
 
// Import translations
import en from './locales/en.json';
import es from './locales/es.json';

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
