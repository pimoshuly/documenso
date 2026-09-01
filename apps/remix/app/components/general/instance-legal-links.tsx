import { getInstanceBranding, resolveInstanceBrandingUrl } from '@documenso/lib/constants/instance-branding';
import { cn } from '@documenso/ui/lib/utils';
import { Trans } from '@lingui/react/macro';
import { Link } from 'react-router';

export type InstanceLegalLinksProps = {
  className?: string;
};

export const InstanceLegalLinks = ({ className }: InstanceLegalLinksProps) => {
  const branding = getInstanceBranding();
  const sourceCodeUrl = resolveInstanceBrandingUrl(branding.sourceCodeUrl);

  return (
    <nav
      aria-label="Legal"
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs', className)}
    >
      {sourceCodeUrl && (
        <a
          href={sourceCodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground hover:underline"
        >
          <Trans>Source code</Trans>
        </a>
      )}

      <Link to="/articles/license" className="hover:text-foreground hover:underline">
        <Trans>AGPL-3.0 license</Trans>
      </Link>
    </nav>
  );
};
