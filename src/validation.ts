import type { ResolvedTourGuideConfig, TourStep } from './types';
import { isDev, warn } from './dev';

const VALID_POSITIONS = ['top', 'bottom', 'left', 'right', 'auto'];
const VALID_MOTIONS = ['morph', 'bounce', 'fade', 'none'];

/**
 * Does this value look like a React ref object (`{ current: ... }`)?
 * Callback refs and bare component instances are the two things people pass by
 * mistake, and both fail silently at measure time — so we detect them up front.
 */
const looksLikeRef = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && 'current' in (value as object);

/**
 * Validate tour steps and config in development and report actionable warnings.
 *
 * Every check here corresponds to a mistake that otherwise fails *silently* at
 * runtime — the tour simply does nothing, or shows a centered tooltip with no
 * explanation — which is the hardest class of bug to diagnose from the outside.
 * Runs only in dev; it is a no-op in production builds.
 */
export const validateTour = (steps: TourStep[], config?: ResolvedTourGuideConfig): void => {
  if (!isDev()) return;

  if (!Array.isArray(steps)) {
    warn(
      `startTour() was called with ${typeof steps} instead of an array of steps.`,
      'Pass an array: startTour([{ id, title, description }]).'
    );
    return;
  }

  if (steps.length === 0) {
    warn(
      'startTour() was called with an empty steps array, so there is nothing to show.',
      'Pass at least one step, and build the array before calling startTour().'
    );
    return;
  }

  const seenIds = new Set<string>();

  steps.forEach((step, index) => {
    const where = `Step ${index}${step?.id ? ` ("${step.id}")` : ''}`;

    if (!step || typeof step !== 'object') {
      warn(
        `${where} is not an object.`,
        'Each step must be an object with id, title and description.'
      );
      return;
    }

    // --- id ---
    if (!step.id) {
      warn(
        `${where} has no "id".`,
        'Give every step a unique string id — it is used for React keys and warnings.'
      );
    } else if (seenIds.has(step.id)) {
      warn(
        `${where} reuses the id "${step.id}", which is already used by an earlier step.`,
        'Make every step id unique so steps can be told apart.'
      );
    } else {
      seenIds.add(step.id);
    }

    // --- content ---
    if (typeof step.title !== 'string' || step.title.length === 0) {
      warn(
        `${where} has no "title".`,
        'Provide a non-empty title string; it is the tooltip heading.'
      );
    }
    if (typeof step.description !== 'string' || step.description.length === 0) {
      warn(
        `${where} has no "description".`,
        'Provide a non-empty description string; it is the tooltip body.'
      );
    }

    if (step.targetRegion !== undefined) {
      const r = step.targetRegion;
      if (
        typeof r !== 'object' ||
        r === null ||
        [r.x, r.y, r.width, r.height].some((v) => typeof v !== 'number' || Number.isNaN(v)) ||
        r.width <= 0 ||
        r.height <= 0
      ) {
        warn(
          `${where} has an invalid targetRegion — it needs numeric x, y and positive width/height in window px.`,
          'Example: targetRegion: { x: 24, y: 120, width: 200, height: 80 }.'
        );
      }
      if (step.targetRef !== undefined || step.targetId !== undefined) {
        warn(
          `${where} sets targetRegion together with targetRef/targetId — targetRegion wins and the others are ignored.`,
          'Use one targeting method per step.'
        );
      }
    }

    if (step.motion !== undefined && !VALID_MOTIONS.includes(step.motion)) {
      warn(
        `${where} has motion "${step.motion}", which is not valid.`,
        `Use one of: ${VALID_MOTIONS.join(', ')}.`
      );
    }

    if (step.targetRef !== undefined && step.targetId !== undefined) {
      warn(
        `${where} sets both targetRef and targetId — targetRef wins and targetId is ignored.`,
        'Use one or the other.'
      );
    }

    // --- targetRef: the single most common wiring mistake ---
    if (step.targetRef !== undefined && !looksLikeRef(step.targetRef)) {
      warn(
        `${where} has a "targetRef" that is not a ref object (received ${typeof step.targetRef}).`,
        'Pass the ref itself, not its value: targetRef={myRef} where const myRef = useRef(null). Callback refs are not supported.'
      );
    }

    // --- tooltipPosition ---
    if (step.tooltipPosition !== undefined && !VALID_POSITIONS.includes(step.tooltipPosition)) {
      warn(
        `${where} has tooltipPosition "${step.tooltipPosition}", which is not valid.`,
        `Use one of: ${VALID_POSITIONS.join(', ')}.`
      );
    }

    // --- numeric options ---
    if (step.spotlightPadding !== undefined) {
      const pads =
        typeof step.spotlightPadding === 'number'
          ? [step.spotlightPadding]
          : Object.values(step.spotlightPadding);
      if (pads.some((v) => typeof v === 'number' && v < 0)) {
        warn(
          `${where} has a negative spotlightPadding, which shrinks the spotlight below the target.`,
          'Use values >= 0.'
        );
      }
    }
    if (step.autoAdvance !== undefined && step.autoAdvance > 0 && step.autoAdvance < 500) {
      warn(
        `${where} sets autoAdvance to ${step.autoAdvance}ms, which is too fast to read.`,
        'Use at least 500ms, or 0 to disable auto-advance.'
      );
    }

    // --- per-step scroll config ---
    const stepScroll = step.scrollToTarget;
    if (stepScroll && !looksLikeRef(stepScroll.scrollRef)) {
      warn(
        `${where} has scrollToTarget.scrollRef that is not a ref object.`,
        'Pass the ScrollView/FlatList ref itself: scrollRef={scrollViewRef}.'
      );
    }
    if (
      stepScroll?.getCurrentScrollOffset !== undefined &&
      typeof stepScroll.getCurrentScrollOffset !== 'function'
    ) {
      warn(
        `${where} has scrollToTarget.getCurrentScrollOffset that is not a function.`,
        'Pass a getter function: getCurrentScrollOffset: () => scrollY.'
      );
    }

    // --- hiding every control on a step traps the user ---
    if (step.hideNextButton && step.hideSkipButton && !step.autoAdvance) {
      warn(
        `${where} hides both the next and skip buttons with no autoAdvance, leaving no way to continue the tour.`,
        'Keep one of them visible, set autoAdvance, or handle advancing yourself via onSpotlightPress / backdropBehavior.'
      );
    }
  });

  if (steps.some((st) => st?.interactive) && config?.overlayMode !== 'inline') {
    warn(
      "A step sets interactive: true but config.overlayMode is not 'inline', so the Modal overlay will swallow the touches anyway.",
      "Set overlayMode: 'inline' on the tour config to let touches reach the highlighted element."
    );
  }

  validateConfig(config);
};

/** Validate the tour-level config. Dev only. */
const validateConfig = (config?: ResolvedTourGuideConfig): void => {
  if (!config) return;

  if (config.scrollRef !== undefined && !looksLikeRef(config.scrollRef)) {
    warn(
      `config.scrollRef is not a ref object (received ${typeof config.scrollRef}).`,
      'Pass the ref itself: scrollRef: scrollViewRef, where const scrollViewRef = useRef(null).'
    );
  }

  if (
    config.getCurrentScrollOffset !== undefined &&
    typeof config.getCurrentScrollOffset !== 'function'
  ) {
    warn(
      'config.getCurrentScrollOffset is not a function.',
      'Pass a getter: getCurrentScrollOffset: () => scrollY.'
    );
  }

  if (config.renderTooltip !== undefined && typeof config.renderTooltip !== 'function') {
    warn(
      'config.renderTooltip is not a function.',
      'Pass a render function: renderTooltip: (props) => <MyTooltip {...props} />.'
    );
  }

  if (config.animationDuration !== undefined && config.animationDuration < 0) {
    warn(
      'config.animationDuration is negative.',
      'Use 0 to disable animation, or a positive duration in ms.'
    );
  }

  if (config.motion !== undefined && !VALID_MOTIONS.includes(config.motion)) {
    warn(
      `config.motion "${config.motion}" is not valid.`,
      `Use one of: ${VALID_MOTIONS.join(', ')}.`
    );
  }

  if (
    config.spotlightStyles?.maskPath !== undefined &&
    typeof config.spotlightStyles.maskPath !== 'function'
  ) {
    warn(
      'config.spotlightStyles.maskPath is not a function.',
      'Pass a function returning an SVG subpath: maskPath: ({ bounds }) => `M…Z`.'
    );
  }

  if (config.tooltipWidth !== undefined && config.tooltipWidth <= 0) {
    warn('config.tooltipWidth must be greater than 0.', 'Remove it to use the 320px default.');
  }
};
