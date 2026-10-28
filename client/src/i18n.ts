import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ml from './locales/ml.json';

// Detect stored language or browser language
const getInitialLanguage = (): string => {
  const saved = localStorage.getItem('dd_lang');
  if (saved && ['en', 'hi', 'ml'].includes(saved.toLowerCase())) {
    return saved.toLowerCase();
  }

  // Detect browser language
  const browser = navigator.language?.toLowerCase() || 'en';
  if (browser.startsWith('hi')) return 'hi';
  if (browser.startsWith('ml')) return 'ml';
  return 'en';
};

const initialLang = getInitialLanguage();

// Set initial document attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ml: { translation: ml },
    },
    lng: initialLang,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    missingKeyHandler: (lngs, ns, key) => {
      if (import.meta.env?.DEV) {
        console.warn(`[i18n] Missing translation key "${key}" for language(s): ${lngs.join(', ')}`);
      }
    },
  });

// Listen for language changes to update document tag & font styles
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    localStorage.setItem('dd_lang', lng);
  }
});

export default i18n;
