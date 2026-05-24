import type { Lang } from '../types';

type T = {
  tagline: string;
  getStarted: string;
  welcome: string;
};

export const TRANSLATIONS: Record<Lang, T> = {
  Hindi: {
    tagline:    'आवाज़-आधारित वित्तीय सहायक',
    getStarted: 'शुरू करें',
    welcome:    'ArthSaathi में आपका स्वागत है',
  },
  English: {
    tagline:    'Voice-first financial assistant',
    getStarted: 'Get Started',
    welcome:    'Welcome to ArthSaathi',
  },
  Marathi: {
    tagline:    'आवाज-आधारित आर्थिक सहाय्यक',
    getStarted: 'सुरू करा',
    welcome:    'ArthSaathi मध्ये स्वागत आहे',
  },
  Tamil: {
    tagline:    'குரல்-முதல் நிதி உதவியாளர்',
    getStarted: 'தொடங்கு',
    welcome:    'ArthSaathi-க்கு வரவேற்கிறோம்',
  },
  Telugu: {
    tagline:    'వాయిస్-ఫస్ట్ ఆర్థిక సహాయకుడు',
    getStarted: 'ప్రారంభించండి',
    welcome:    'ArthSaathi కి స్వాగతం',
  },
};