import { getInstanceBranding, resolveInstanceBrandingUrl } from '@documenso/lib/constants/instance-branding';
import { cn } from '@documenso/ui/lib/utils';

export type BrandingLogoProps = {
  className?: string;
};

export const BrandingLogo = ({ className }: BrandingLogoProps) => {
  const branding = getInstanceBranding();
  const logoUrl = resolveInstanceBrandingUrl(branding.logoUrl);

  if (logoUrl) {
    return <img src={logoUrl} alt={`${branding.name} logo`} className={cn('object-contain', className)} />;
  }

  return (
    <span
      role="img"
      aria-label={branding.name}
      className={cn('inline-flex items-center whitespace-nowrap font-semibold leading-none', className)}
    >
      {branding.name}
    </span>
  );
};
