import type { InstanceBrandingConfig } from '@documenso/lib/constants/instance-branding';
import type { EmailBrandingColors } from '@documenso/lib/utils/email-branding-colors';
import { getInstanceEmailBrandingColors } from '@documenso/lib/utils/email-branding-colors';
import type { I18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import * as ReactEmail from '@react-email/render';

import { Tailwind } from './components';
import { BrandingProvider, type BrandingSettings } from './providers/branding';

export type RenderOptions = ReactEmail.Options & {
  branding?: BrandingSettings;
  instanceBranding?: InstanceBrandingConfig;
  i18n?: I18n;
};

/**
 * Map the resolved colour set to flat semantic Tailwind tokens. Templates use
 * these directly (`bg-primary`, `text-muted-foreground`, `border-border`, …),
 * mirroring the app's shadcn tokens, instead of bespoke `slate-*`/`documenso-*`
 * scale classes.
 *
 * Always defined: legitimately enabled tenant colours take precedence; all
 * other renders use the palette derived from the canonical instance brand.
 */
const buildEmailColors = (
  brandingColors?: EmailBrandingColors,
  instanceBranding?: InstanceBrandingConfig,
): Record<string, string> => {
  const c = brandingColors ?? getInstanceEmailBrandingColors(instanceBranding);

  return {
    background: c.background,
    foreground: c.foreground,
    muted: c.muted,
    'muted-foreground': c.mutedForeground,
    primary: c.primary,
    'primary-foreground': c.primaryForeground,
    secondary: c.secondary,
    'secondary-foreground': c.secondaryForeground,
    accent: c.accent,
    'accent-foreground': c.accentForeground,
    destructive: c.destructive,
    'destructive-foreground': c.destructiveForeground,
    warning: c.warning,
    border: c.border,
  };
};

export const render = async (element: React.ReactNode, options?: RenderOptions) => {
  const { branding, instanceBranding, ...otherOptions } = options ?? {};

  const tailwindColors = buildEmailColors(
    branding?.brandingEnabled ? branding.brandingColors : undefined,
    instanceBranding,
  );

  return await ReactEmail.render(
    <BrandingProvider branding={branding} instanceBranding={instanceBranding}>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: tailwindColors,
            },
          },
        }}
      >
        {element}
      </Tailwind>
    </BrandingProvider>,
    otherOptions,
  );
};

export const renderWithI18N = async (element: React.ReactNode, options?: RenderOptions) => {
  const { branding, instanceBranding, i18n, ...otherOptions } = options ?? {};

  if (!i18n) {
    throw new Error('i18n is required');
  }

  const tailwindColors = buildEmailColors(
    branding?.brandingEnabled ? branding.brandingColors : undefined,
    instanceBranding,
  );

  return await ReactEmail.render(
    <I18nProvider i18n={i18n}>
      <BrandingProvider branding={branding} instanceBranding={instanceBranding}>
        <Tailwind
          config={{
            theme: {
              extend: {
                colors: tailwindColors,
              },
            },
          }}
        >
          {element}
        </Tailwind>
      </BrandingProvider>
    </I18nProvider>,
    otherOptions,
  );
};
