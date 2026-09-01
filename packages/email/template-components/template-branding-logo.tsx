import { resolveInstanceBrandingUrl } from '@documenso/lib/constants/instance-branding';

import { Img, Link, Text } from '../components';
import { useBranding } from '../providers/branding';
import { getSafeBrandingUrl } from '../utils/branding-url';

export type TemplateBrandingLogoProps = {
  assetBaseUrl: string;
  className?: string;
};

/**
 * Renders the email logo.
 *
 * - When custom branding is enabled with a logo, the branding logo is shown.
 *   If a safe (http/https) Brand Website is configured, the logo links to it.
 * - Otherwise the instance logo or accessible instance name is shown.
 */
export const TemplateBrandingLogo = ({ className = 'mb-4 h-6' }: TemplateBrandingLogoProps) => {
  const branding = useBranding();
  const tenantLogoUrl = branding.brandingEnabled ? getSafeBrandingUrl(branding.brandingLogo) : null;
  const instanceLogoUrl = resolveInstanceBrandingUrl(branding.instanceBranding.logoUrl, { absolute: true });
  const logoUrl = tenantLogoUrl ?? instanceLogoUrl;
  const tenantWebsiteUrl = branding.brandingEnabled ? getSafeBrandingUrl(branding.brandingUrl) : null;
  const instanceWebsiteUrl = resolveInstanceBrandingUrl(branding.instanceBranding.websiteUrl, { absolute: true });
  const websiteUrl = tenantWebsiteUrl ?? instanceWebsiteUrl;

  if (!logoUrl) {
    return <Text className="mb-4 font-semibold text-foreground text-xl">{branding.instanceBranding.name}</Text>;
  }

  const logo = (
    <Img
      src={logoUrl}
      alt={tenantLogoUrl ? 'Custom brand logo' : `${branding.instanceBranding.name} logo`}
      className={className}
    />
  );

  if (!websiteUrl) {
    return logo;
  }

  return (
    <Link href={websiteUrl} target="_blank">
      {logo}
    </Link>
  );
};

export default TemplateBrandingLogo;
