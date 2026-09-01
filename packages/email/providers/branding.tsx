import { getInstanceBranding, type InstanceBrandingConfig } from '@documenso/lib/constants/instance-branding';
import type { EmailBrandingColors } from '@documenso/lib/utils/email-branding-colors';
import { createContext, useContext } from 'react';

export type BrandingSettings = {
  brandingEnabled: boolean;
  brandingUrl: string;
  brandingLogo: string;
  brandingCompanyDetails: string;
  brandingHidePoweredBy: boolean;
  brandingColors?: EmailBrandingColors;
};

type BrandingContextValue = BrandingSettings & {
  instanceBranding: InstanceBrandingConfig;
};

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

const defaultBrandingSettings: BrandingSettings = {
  brandingEnabled: false,
  brandingUrl: '',
  brandingLogo: '',
  brandingCompanyDetails: '',
  brandingHidePoweredBy: false,
};

export const BrandingProvider = (props: {
  branding?: BrandingSettings;
  instanceBranding?: InstanceBrandingConfig;
  children: React.ReactNode;
}) => {
  const instanceBranding = props.instanceBranding ?? getInstanceBranding();
  const value: BrandingContextValue = {
    ...defaultBrandingSettings,
    ...props.branding,
    instanceBranding,
  };

  return <BrandingContext.Provider value={value}>{props.children}</BrandingContext.Provider>;
};

export const useBranding = () => {
  const ctx = useContext(BrandingContext);

  if (!ctx) {
    throw new Error('Branding context not found');
  }

  return ctx;
};
