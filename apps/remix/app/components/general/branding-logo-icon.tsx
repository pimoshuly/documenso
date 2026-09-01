import { getInstanceBranding, resolveInstanceBrandingUrl } from '@documenso/lib/constants/instance-branding';
import { cn } from '@documenso/ui/lib/utils';

export type BrandingLogoIconProps = {
  className?: string;
};

export const BrandingLogoIcon = ({ className }: BrandingLogoIconProps) => {
  const branding = getInstanceBranding();
  const iconUrl = resolveInstanceBrandingUrl(branding.iconUrl ?? branding.logoUrl);

  if (iconUrl) {
    return <img src={iconUrl} alt={`${branding.name} icon`} className={cn('object-contain', className)} />;
  }

  return (
    <span
      role="img"
      aria-label={`${branding.name} icon`}
      className={cn(
        'inline-flex aspect-square items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground leading-none',
        className,
      )}
    >
      {branding.shortName.slice(0, 1).toUpperCase()}
    </span>
  );
};
