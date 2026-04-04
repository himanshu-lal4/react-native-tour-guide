import type { TourTheme } from './types';

export const darkTheme: TourTheme = {
  tooltipStyles: {
    backgroundColor: '#2C2C2E',
    titleColor: '#FFFFFF',
    descriptionColor: '#EBEBF5',
    buttonTextColor: '#FFFFFF',
    primaryButtonColor: '#007AFF',
    secondaryButtonColor: '#3A3A3C',
    skipButtonColor: '#8E8E93',
    borderRadius: 12,
  },
  spotlightStyles: {
    overlayColor: 'black',
    overlayOpacity: 0.6,
  },
};

export const lightTheme: TourTheme = {
  tooltipStyles: {
    backgroundColor: '#FFFFFF',
    titleColor: '#1C1C1E',
    descriptionColor: '#3A3A3C',
    buttonTextColor: '#FFFFFF',
    primaryButtonColor: '#007AFF',
    secondaryButtonColor: '#E5E5EA',
    skipButtonColor: '#8E8E93',
    borderRadius: 12,
  },
  spotlightStyles: {
    overlayColor: 'black',
    overlayOpacity: 0.4,
  },
};

export const minimalTheme: TourTheme = {
  tooltipStyles: {
    backgroundColor: '#FAFAFA',
    titleColor: '#333333',
    descriptionColor: '#666666',
    buttonTextColor: '#FFFFFF',
    primaryButtonColor: '#555555',
    secondaryButtonColor: '#E0E0E0',
    skipButtonColor: '#999999',
    borderRadius: 8,
  },
  spotlightStyles: {
    overlayColor: 'black',
    overlayOpacity: 0.3,
  },
};

export const vibrantTheme: TourTheme = {
  tooltipStyles: {
    backgroundColor: '#1A1A2E',
    titleColor: '#EAEAEA',
    descriptionColor: '#B0B0C0',
    buttonTextColor: '#FFFFFF',
    primaryButtonColor: '#E94560',
    secondaryButtonColor: '#16213E',
    skipButtonColor: '#8E8E93',
    borderRadius: 16,
  },
  spotlightStyles: {
    overlayColor: '#0F0F23',
    overlayOpacity: 0.7,
  },
};

/**
 * Create a custom theme by deep-merging overrides onto the dark theme base.
 */
export const createTheme = (overrides: Partial<TourTheme>): TourTheme => ({
  tooltipStyles: {
    ...darkTheme.tooltipStyles,
    ...overrides.tooltipStyles,
  },
  spotlightStyles: {
    ...darkTheme.spotlightStyles,
    ...overrides.spotlightStyles,
  },
});
