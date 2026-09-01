import { colord } from 'colord';

import { getInstanceBranding, type InstanceBrandingConfig } from '../constants/instance-branding';
import { DEFAULT_BRAND_COLORS } from '../constants/theme';
import type { TCssVarsSchema } from '../types/css-vars';

/**
 * The `brandingColors` tokens that emails actually render — the canonical
 * subset of `TCssVarsSchema`. `TCssVarsSchema` is the single source of truth
 * for token names; this tuple just selects the ones email templates use, and
 * both the `EmailBrandingColors` type and the resolver below derive from it.
 */
export const EMAIL_BRANDING_COLOR_KEYS = [
  'background',
  'foreground',
  'muted',
  'mutedForeground',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'accent',
  'accentForeground',
  'destructive',
  'destructiveForeground',
  'warning',
  'border',
] as const satisfies readonly (keyof TCssVarsSchema)[];

export type EmailBrandingColorKey = (typeof EMAIL_BRANDING_COLOR_KEYS)[number];

/**
 * Resolved, email-ready brand colour set.
 *
 * Emails cannot use CSS variables, so every value here is a concrete hex
 * string. This is the shape carried through the email branding context and
 * injected into the per-render Tailwind config.
 *
 * Derived from `TCssVarsSchema` (the persisted shape) by narrowing to the
 * email token subset and making every field required: the resolver fills every
 * token from the supplied fallback palette, so consumers never see `undefined`.
 *
 * Produced by `resolveEmailBrandingColors`, or `null` when the tenant has no
 * usable/safe colour set.
 */
export type EmailBrandingColors = Required<Pick<TCssVarsSchema, EmailBrandingColorKey>>;

/**
 * Normalise an arbitrary stored colour value (hex or any colord-parseable
 * string) to a hex string. Returns `null` for missing/invalid input.
 *
 * `brandingColors` is validated loosely (`z.string()`) so values are not
 * guaranteed to be valid colours — parse defensively.
 */
export const normalizeColorToHex = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const parsed = colord(value);

  if (!parsed.isValid()) {
    return null;
  }

  return parsed.toHex();
};

/**
 * Resolve a tenant's stored `brandingColors` into an email-ready colour set.
 *
 * Each token is taken from the tenant value when it parses to a valid colour,
 * otherwise the supplied fallback. We do NOT enforce contrast or readability —
 * if a tenant picks a low-contrast combination that is their choice; the
 * preview UI can hint at it, but the renderer just applies what was set.
 *
 * Returns `null` only when there
 * is no `brandingColors` object at all.
 */
export const resolveEmailBrandingColors = (
  brandingColors: TCssVarsSchema | null | undefined,
  fallbackColors: EmailBrandingColors = DEFAULT_BRAND_COLORS,
): EmailBrandingColors | null => {
  if (!brandingColors) {
    return null;
  }

  const resolve = (value: string | null | undefined, fallback: string): string =>
    normalizeColorToHex(value) ?? fallback;

  return {
    background: resolve(brandingColors.background, fallbackColors.background),
    foreground: resolve(brandingColors.foreground, fallbackColors.foreground),
    muted: resolve(brandingColors.muted, fallbackColors.muted),
    mutedForeground: resolve(brandingColors.mutedForeground, fallbackColors.mutedForeground),
    primary: resolve(brandingColors.primary, fallbackColors.primary),
    primaryForeground: resolve(brandingColors.primaryForeground, fallbackColors.primaryForeground),
    secondary: resolve(brandingColors.secondary, fallbackColors.secondary),
    secondaryForeground: resolve(brandingColors.secondaryForeground, fallbackColors.secondaryForeground),
    accent: resolve(brandingColors.accent, fallbackColors.accent),
    accentForeground: resolve(brandingColors.accentForeground, fallbackColors.accentForeground),
    destructive: resolve(brandingColors.destructive, fallbackColors.destructive),
    destructiveForeground: resolve(brandingColors.destructiveForeground, fallbackColors.destructiveForeground),
    warning: resolve(brandingColors.warning, fallbackColors.warning),
    border: resolve(brandingColors.border, fallbackColors.border),
  };
};

export const getInstanceEmailBrandingColors = (
  branding: InstanceBrandingConfig = getInstanceBranding(),
): EmailBrandingColors => {
  return (
    resolveEmailBrandingColors({
      primary: branding.primaryColor,
      primaryForeground: branding.primaryForegroundColor,
    }) ?? DEFAULT_BRAND_COLORS
  );
};
