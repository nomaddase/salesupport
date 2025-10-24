import { useMemo } from 'react';
import ru from '@/locales/ru.json';

const dictionaries = {
  ru
};

export default function useTranslations(locale = 'ru') {
  const messages = useMemo(() => dictionaries[locale] || dictionaries.ru, [locale]);

  const t = (key) => messages[key] || key;

  return { t, locale, messages };
}
