import { useMemo } from 'react';

import { TRANSLATIONS, type TranslationSet } from '../constants/translations';
import { useStore } from '../store';
import type { Lang } from '../types';

export function getTranslations(language: Lang): TranslationSet {
  return TRANSLATIONS[language] ?? TRANSLATIONS.English;
}

export function useTranslations() {
  const language = useStore((state) => state.language);
  return useMemo(() => getTranslations(language), [language]);
}
