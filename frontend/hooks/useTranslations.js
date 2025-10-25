import { useMemo } from 'react';
import ru from '@/locales/ru.json';

const dictionaries = {
  ru
};

export default function useTranslations(locale = 'ru') {
  const messages = useMemo(() => dictionaries[locale] || dictionaries.ru, [locale]);

  const t = (key, values) => {
    const template = messages[key] ?? key;

    if (!values) {
      return template;
    }

    return Object.entries(values).reduce((acc, [token, value]) => {
      return acc.replace(new RegExp(`{${token}}`, 'g'), value);
    }, template);
  };

  return { t, locale, messages };
}
