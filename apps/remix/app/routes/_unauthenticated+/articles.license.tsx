import { getInstanceBranding } from '@documenso/lib/constants/instance-branding';
import { Trans } from '@lingui/react/macro';

import { InstanceLegalLinks } from '~/components/general/instance-legal-links';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags();
}

export default function LicensePage() {
  const branding = getInstanceBranding();

  return (
    <article className="mx-auto max-w-2xl rounded-xl border bg-background p-6 shadow-sm md:p-8">
      <h1 className="font-semibold text-2xl">
        <Trans>Source code and license</Trans>
      </h1>

      <div className="mt-4 space-y-4 text-muted-foreground text-sm leading-6">
        {(branding.legalName || branding.legalAddress) && (
          <p>
            {branding.legalName}
            {branding.legalName && branding.legalAddress && <br />}
            {branding.legalAddress && <span className="whitespace-pre-line">{branding.legalAddress}</span>}
          </p>
        )}

        <p>
          <Trans>{branding.name} is based on Documenso v2.17.0 and includes modifications for instance branding.</Trans>
        </p>

        <p>
          <Trans>
            This software is provided under the GNU Affero General Public License version 3. You may use, study, modify,
            and redistribute it under that license. It is provided without warranty.
          </Trans>
        </p>

        {branding.sourceCodeUrl ? (
          <p>
            <Trans>
              The corresponding source for this deployed version is available from the source code link below.
            </Trans>
          </p>
        ) : (
          <p>
            <Trans>The operator has not configured a corresponding source code URL for this instance.</Trans>
          </p>
        )}
      </div>

      <InstanceLegalLinks className="mt-6" />

      <a
        href={branding.licenseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-primary text-sm hover:underline"
      >
        <Trans>Read the complete AGPL-3.0 license</Trans>
      </a>
    </article>
  );
}
