import { AccessibilityInfo, Platform } from 'react-native';

import type { TourStep, TourGuideConfig } from './types';

/**
 * Announce a step change to screen readers (VoiceOver / TalkBack).
 */
export const announceStep = (
  step: TourStep,
  stepIndex: number,
  totalSteps: number,
  config?: TourGuideConfig
) => {
  const enabled = config?.enableAccessibility !== false;
  if (!enabled) return;

  const prefix = config?.accessibilityLabelPrefix ?? 'Tour guide';

  // Use custom label if provided, otherwise build from title/description
  const label =
    step.accessibilityLabel ??
    `${prefix}, step ${stepIndex + 1} of ${totalSteps}. ${step.title}. ${step.description}`;

  // Small delay to ensure the UI has updated before announcing
  setTimeout(() => {
    // announceForAccessibility is not available on web — use ARIA live regions instead
    if (Platform.OS !== 'web' && typeof AccessibilityInfo.announceForAccessibility === 'function') {
      AccessibilityInfo.announceForAccessibility(label);
    }
  }, 100);
};

/**
 * Build the accessibility label for the tooltip container.
 */
export const getTooltipAccessibilityProps = (
  step: TourStep,
  stepIndex: number,
  totalSteps: number,
  config?: TourGuideConfig
) => {
  const enabled = config?.enableAccessibility !== false;
  if (!enabled) return {};

  const prefix = config?.accessibilityLabelPrefix ?? 'Tour guide';

  return {
    accessible: true,
    accessibilityRole: 'alert' as const,
    accessibilityLabel:
      step.accessibilityLabel ??
      `${prefix}, step ${stepIndex + 1} of ${totalSteps}. ${step.title}. ${step.description}`,
    accessibilityHint: Platform.select({
      ios: 'Swipe right for next step, left for previous',
      android: 'Use the buttons to navigate the tour',
      default: 'Use the buttons to navigate the tour',
    }),
    accessibilityLiveRegion: 'polite' as const,
  };
};
