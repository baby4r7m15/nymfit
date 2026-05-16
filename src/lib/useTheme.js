import { useEffect } from 'react';
import { useUser } from '@/lib/UserContext';

export const THEMES = [
  {
    id: 'trans_dark',
    name: 'Trans Dark',
    emoji: '🏳️‍⚧️',
    description: 'Deep navy with trans flag accents',
    premium: false,
    vars: {
      '--background': '213 35% 10%',
      '--foreground': '210 40% 96%',
      '--card': '213 30% 14%',
      '--card-foreground': '210 40% 96%',
      '--popover': '213 30% 14%',
      '--popover-foreground': '210 40% 96%',
      '--primary': '350 100% 82%',
      '--primary-foreground': '350 40% 15%',
      '--secondary': '199 100% 74%',
      '--secondary-foreground': '213 40% 8%',
      '--muted': '213 25% 18%',
      '--muted-foreground': '213 18% 58%',
      '--accent': '213 40% 19%',
      '--accent-foreground': '199 100% 82%',
      '--border': '213 25% 22%',
      '--input': '213 25% 22%',
      '--ring': '350 100% 82%',
    },
  },
  {
    id: 'rose_soft',
    name: 'Rose Soft',
    emoji: '🌹',
    description: 'Soft rose tones on warm cream',
    premium: true,
    vars: {
      '--background': '340 30% 97%',
      '--foreground': '340 25% 15%',
      '--card': '340 20% 100%',
      '--card-foreground': '340 25% 15%',
      '--popover': '340 20% 100%',
      '--popover-foreground': '340 25% 15%',
      '--primary': '340 80% 55%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '350 60% 85%',
      '--secondary-foreground': '340 25% 20%',
      '--muted': '340 15% 92%',
      '--muted-foreground': '340 15% 50%',
      '--accent': '340 25% 93%',
      '--accent-foreground': '340 80% 45%',
      '--border': '340 20% 88%',
      '--input': '340 20% 88%',
      '--ring': '340 80% 55%',
    },
  },
  {
    id: 'midnight_purple',
    name: 'Midnight Purple',
    emoji: '💜',
    description: 'Deep purple with lavender accents',
    premium: true,
    vars: {
      '--background': '270 30% 8%',
      '--foreground': '270 30% 95%',
      '--card': '270 25% 12%',
      '--card-foreground': '270 30% 95%',
      '--popover': '270 25% 12%',
      '--popover-foreground': '270 30% 95%',
      '--primary': '280 70% 75%',
      '--primary-foreground': '280 40% 10%',
      '--secondary': '250 60% 70%',
      '--secondary-foreground': '270 30% 8%',
      '--muted': '270 20% 16%',
      '--muted-foreground': '270 15% 55%',
      '--accent': '270 30% 18%',
      '--accent-foreground': '280 70% 80%',
      '--border': '270 20% 20%',
      '--input': '270 20% 20%',
      '--ring': '280 70% 75%',
    },
  },
  {
    id: 'cotton_candy',
    name: 'Cotton Candy',
    emoji: '🍬',
    description: 'Pastel pink & blue on soft white',
    premium: true,
    vars: {
      '--background': '300 20% 98%',
      '--foreground': '300 20% 15%',
      '--card': '0 0% 100%',
      '--card-foreground': '300 20% 15%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '300 20% 15%',
      '--primary': '330 90% 72%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '195 80% 72%',
      '--secondary-foreground': '300 20% 15%',
      '--muted': '300 15% 93%',
      '--muted-foreground': '300 10% 50%',
      '--accent': '300 20% 94%',
      '--accent-foreground': '330 90% 60%',
      '--border': '300 15% 88%',
      '--input': '300 15% 88%',
      '--ring': '330 90% 72%',
    },
  },
];

export function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}

export function useTheme() {
  const { user } = useUser();
  const activeTheme = user?.theme || 'trans_dark';

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  return { activeTheme };
}