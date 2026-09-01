import { resolveInstanceBrandingUrl } from '@documenso/lib/constants/instance-branding';
import { Trans } from '@lingui/react/macro';
import { Fragment } from 'react';

import { Link, Section, Text } from '../components';
import { useBranding } from '../providers/branding';
import { getSafeBrandingUrl } from '../utils/branding-url';

export type TemplateFooterProps = {
  isDocument?: boolean;
  reportUrl?: string;
};

export const TemplateFooter = ({ reportUrl }: TemplateFooterProps) => {
  const branding = useBranding();
  const tenantCompanyDetails =
    branding.brandingEnabled && branding.brandingCompanyDetails ? branding.brandingCompanyDetails : null;
  const instanceCompanyDetails = [branding.instanceBranding.legalName, branding.instanceBranding.legalAddress]
    .filter((value): value is string => Boolean(value))
    .join('\n');
  const companyDetails = tenantCompanyDetails ?? instanceCompanyDetails;
  const tenantWebsiteUrl = branding.brandingEnabled ? getSafeBrandingUrl(branding.brandingUrl) : null;
  const instanceWebsiteUrl = resolveInstanceBrandingUrl(branding.instanceBranding.websiteUrl, { absolute: true });
  const websiteUrl = tenantWebsiteUrl ?? instanceWebsiteUrl;

  return (
    <Section>
      {reportUrl && (
        <Text className="my-4 text-base text-muted-foreground">
          <Trans>
            Did not expect this email?{' '}
            <Link className="text-primary" href={reportUrl}>
              Click here to report the sender
            </Link>
            . Never sign a document you don't recognize or weren't expecting.
          </Trans>
        </Text>
      )}

      {branding.instanceBranding.emailFooterText && (
        <MultilineText
          value={branding.instanceBranding.emailFooterText}
          className="my-4 text-muted-foreground text-sm"
        />
      )}

      {!branding.brandingEnabled && (
        <Text className="my-4 font-medium text-foreground text-sm">{branding.instanceBranding.name}</Text>
      )}

      {companyDetails && <MultilineText value={companyDetails} className="my-4 text-muted-foreground text-sm" />}

      {(websiteUrl || branding.instanceBranding.supportEmail) && (
        <Text className="my-8 text-muted-foreground text-sm">
          {websiteUrl && (
            <Link href={websiteUrl} target="_blank">
              {websiteUrl}
            </Link>
          )}
          {websiteUrl && branding.instanceBranding.supportEmail && <br />}
          {branding.instanceBranding.supportEmail && (
            <Link href={`mailto:${branding.instanceBranding.supportEmail}`}>
              {branding.instanceBranding.supportEmail}
            </Link>
          )}
        </Text>
      )}
    </Section>
  );
};

const MultilineText = ({ value, className }: { value: string; className: string }) => {
  return (
    <Text className={className}>
      {value.split('\n').map((line, index) => (
        <Fragment key={`${line}-${index}`}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </Text>
  );
};

export default TemplateFooter;
