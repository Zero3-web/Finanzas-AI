import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { ColorTheme } from '../types';

type ThemePalette = {
    '--color-primary': string;
    '--color-primary-focus': string;
    '--color-accent': string;
};

export const themes: Record<ColorTheme, ThemePalette> = {
    default: {
        '--color-primary': '114, 63, 235', // #723FEB
        '--color-primary-focus': '90, 47, 186', // #5a2fba
        '--color-accent': '151, 224, 247', // #97E0F7
    },
    ocean: {
        '--color-primary': '15, 116, 143', // #0F748F
        '--color-primary-focus': '11, 88, 109', // #0b586d
        '--color-accent': '144, 224, 239', // #90E0EF
    },
    sunset: {
        '--color-primary': '255, 132, 76', // #FF844C
        '--color-primary-focus': '229, 118, 68', // #e57644
        '--color-accent': '255, 206, 108', // #FFCE6C
    },
    forest: {
        '--color-primary': '56, 102, 65', // #386641
        '--color-primary-focus': '43, 80, 50', // #2b5032
        '--color-accent': '163, 177, 138', // #A3B18A
    }
};

export const useColorTheme = (): [ColorTheme, (theme: ColorTheme) => void] => {
  const [colorTheme, setColorTheme] = useLocalStorage<ColorTheme>('color-theme', 'default');

  useEffect(() => {
    const root = window.document.documentElement;
    const themeColors = themes[colorTheme];

    Object.entries(themeColors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
    
    // Also update the meta theme-color for PWA chrome
    const primaryRgb = themeColors['--color-primary'].split(',').map(Number);
    const primaryHex = '#' + primaryRgb.map(c => c.toString(16).padStart(2, '0')).join('');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', primaryHex);

  }, [colorTheme]);

  return [colorTheme, setColorTheme];
};