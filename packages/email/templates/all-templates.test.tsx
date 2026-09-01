import fs from 'node:fs/promises';
import path from 'node:path';

import { parseInstanceBrandingEnvironment } from '@documenso/lib/constants/instance-branding';
import { getInstanceEmailBrandingColors, resolveEmailBrandingColors } from '@documenso/lib/utils/email-branding-colors';
import { renderEmailWithI18N } from '@documenso/lib/utils/render-email-with-i18n';
import { RecipientRole } from '@prisma/client';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getDefaultProps, templates } from '../preview/app/lib/templates';
import type { BrandingSettings } from '../providers/branding';
import { ConfirmEmailTemplate } from './confirm-email';
import { DocumentCompletedEmailTemplate } from './document-completed';
import { DocumentInviteEmailTemplate } from './document-invite';

const VENDOR_BRANDING_REGEX = /Documenso|documenso\.com|documen\.so|2261 Market Street|San Francisco, CA 94114/i;

const instanceBranding = parseInstanceBrandingEnvironment({
  NEXT_PUBLIC_INSTANCE_NAME: 'Example Sign',
  NEXT_PUBLIC_INSTANCE_SHORT_NAME: 'Example',
  NEXT_PUBLIC_INSTANCE_DESCRIPTION: 'Example signing service',
  NEXT_PUBLIC_INSTANCE_WEBSITE_URL: 'https://sign.example.test',
  NEXT_PUBLIC_INSTANCE_LOGO_URL: 'https://assets.example.test/logo.png',
  NEXT_PUBLIC_INSTANCE_PRIMARY_COLOR: '#2457d6',
  NEXT_PUBLIC_INSTANCE_PRIMARY_FOREGROUND_COLOR: '#ffffff',
  NEXT_PUBLIC_INSTANCE_LEGAL_NAME: 'Example Sign Cooperative',
  NEXT_PUBLIC_INSTANCE_LEGAL_ADDRESS: '1 Example Street\nExample City',
  NEXT_PUBLIC_SUPPORT_EMAIL: 'support@example.test',
  NEXT_PUBLIC_INSTANCE_EMAIL_FOOTER_TEXT: 'Secure messages from Example Sign.',
  NEXT_PUBLIC_SOURCE_CODE_URL: 'https://source.example.test/example-sign',
  NEXT_PUBLIC_INSTANCE_PLANS_URL: 'https://sign.example.test/plans',
});

const renderTemplate = (
  element: React.ReactElement,
  options: { branding?: BrandingSettings; plainText?: boolean } = {},
) => {
  const brandingOptions = {
    lang: 'en' as const,
    instanceBranding,
    branding: options.branding,
  };

  if (options.plainText) {
    return renderEmailWithI18N(element, {
      ...brandingOptions,
      plainText: true,
      unstableTextConversion: true,
    });
  }

  return renderEmailWithI18N(element, brandingOptions);
};

describe('production email templates', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(Object.entries(templates))('renders %s with the configured instance brand', async (_slug, template) => {
    const props = {
      ...getDefaultProps(template.fields),
      assetBaseUrl: 'https://app.example.test',
    };
    const element = createElement(template.component, props);

    const [html, text] = await Promise.all([renderTemplate(element), renderTemplate(element, { plainText: true })]);

    expect(html).toContain(instanceBranding.name);
    expect(html).toContain(instanceBranding.logoUrl);
    expect(html).toContain('alt="Example Sign logo"');
    expect(html).toContain(instanceBranding.emailFooterText);
    expect(text.trim().length).toBeGreaterThan(0);

    for (const output of [html, text]) {
      expect(output).not.toMatch(VENDOR_BRANDING_REGEX);
      expect(output).not.toContain('undefined');
      expect(output).not.toContain('src=""');
      expect(output).not.toContain('href=""');
    }
  });

  it('preserves report, signing, and download action links', async () => {
    const reportUrl = 'https://app.example.test/report/example';
    const signingUrl = 'https://app.example.test/sign/example';
    const downloadUrl = 'https://app.example.test/download/example';

    const invite = createElement(DocumentInviteEmailTemplate, {
      assetBaseUrl: 'https://app.example.test',
      documentName: 'Example Agreement.pdf',
      inviterEmail: 'sender@example.test',
      inviterName: 'Example Sender',
      role: RecipientRole.SIGNER,
      reportUrl,
      signDocumentLink: signingUrl,
    });
    const completed = createElement(DocumentCompletedEmailTemplate, {
      assetBaseUrl: 'https://app.example.test',
      documentName: 'Example Agreement.pdf',
      downloadLink: downloadUrl,
      reportUrl,
    });

    const [inviteHtml, inviteText, completedHtml] = await Promise.all([
      renderTemplate(invite),
      renderTemplate(invite, { plainText: true }),
      renderTemplate(completed),
    ]);

    expect(inviteHtml).toContain(reportUrl);
    expect(inviteHtml).toContain(signingUrl);
    expect(inviteText).toContain(reportUrl);
    expect(inviteText).toContain(signingUrl);
    expect(completedHtml).toContain(downloadUrl);
    expect(completedHtml).toContain(reportUrl);
  });

  it('uses a text logo and compact footer when optional instance fields are missing', async () => {
    const minimalBranding = parseInstanceBrandingEnvironment({
      NEXT_PUBLIC_INSTANCE_NAME: 'Minimal Sign',
    });
    const element = createElement(ConfirmEmailTemplate, {
      assetBaseUrl: 'https://app.example.test',
      confirmationLink: 'https://app.example.test/confirm/example',
    });

    const html = await renderEmailWithI18N(element, {
      lang: 'en',
      instanceBranding: minimalBranding,
    });

    expect(html).toContain('Minimal Sign');
    expect(html).not.toContain('Custom brand logo');
    expect(html).not.toContain('src=""');
    expect(html).not.toContain('href=""');
    expect(html).not.toContain('undefined');
    expect(html).not.toMatch(VENDOR_BRANDING_REGEX);
  });

  it('makes a root-relative instance logo absolute for email clients', async () => {
    vi.stubEnv('NEXT_PUBLIC_WEBAPP_URL', 'https://app.example.test');
    const rootRelativeBranding = parseInstanceBrandingEnvironment({
      NEXT_PUBLIC_INSTANCE_NAME: 'Relative Sign',
      NEXT_PUBLIC_INSTANCE_LOGO_URL: '/static/brand/logo.png',
    });
    const element = createElement(ConfirmEmailTemplate, {
      assetBaseUrl: 'https://app.example.test',
      confirmationLink: 'https://app.example.test/confirm/example',
    });

    const html = await renderEmailWithI18N(element, {
      lang: 'en',
      instanceBranding: rootRelativeBranding,
    });

    expect(html).toContain('https://app.example.test/static/brand/logo.png');
    expect(html).not.toContain('src="/static/brand/logo.png"');
  });

  it('honors an already-resolved tenant brand without changing entitlements', async () => {
    const tenantBranding: BrandingSettings = {
      brandingEnabled: true,
      brandingUrl: 'https://tenant.example.test',
      brandingLogo: 'https://tenant.example.test/logo.png',
      brandingCompanyDetails: 'Tenant Cooperative\n2 Tenant Street',
      brandingHidePoweredBy: false,
      brandingColors:
        resolveEmailBrandingColors(
          {
            primary: '#7c3aed',
            primaryForeground: '#ffffff',
          },
          getInstanceEmailBrandingColors(instanceBranding),
        ) ?? undefined,
    };
    const element = createElement(DocumentInviteEmailTemplate, {
      assetBaseUrl: 'https://app.example.test',
      role: RecipientRole.SIGNER,
      reportUrl: 'https://app.example.test/report/example',
      signDocumentLink: 'https://app.example.test/sign/example',
    });

    const html = await renderTemplate(element, { branding: tenantBranding });

    expect(html).toContain('https://tenant.example.test/logo.png');
    expect(html).toContain('alt="Custom brand logo"');
    expect(html).toContain('https://tenant.example.test');
    expect(html).toContain('Tenant Cooperative');
    expect(html).toContain('rgb(124,58,237)');
    expect(html).not.toContain(instanceBranding.logoUrl);
    expect(html).not.toContain(instanceBranding.legalName);
    expect(html).not.toMatch(VENDOR_BRANDING_REGEX);
  });

  it('ignores tenant values when tenant branding is not enabled', async () => {
    const disabledTenantBranding: BrandingSettings = {
      brandingEnabled: false,
      brandingUrl: 'https://tenant.example.test',
      brandingLogo: 'https://tenant.example.test/logo.png',
      brandingCompanyDetails: 'Tenant Cooperative',
      brandingHidePoweredBy: true,
      brandingColors:
        resolveEmailBrandingColors({ primary: '#7c3aed' }, getInstanceEmailBrandingColors(instanceBranding)) ??
        undefined,
    };
    const element = createElement(DocumentInviteEmailTemplate, {
      assetBaseUrl: 'https://app.example.test',
      role: RecipientRole.SIGNER,
      reportUrl: 'https://app.example.test/report/example',
      signDocumentLink: 'https://app.example.test/sign/example',
    });

    const html = await renderTemplate(element, { branding: disabledTenantBranding });

    expect(html).toContain(instanceBranding.logoUrl);
    expect(html).toContain(instanceBranding.legalName);
    expect(html).not.toContain('https://tenant.example.test/logo.png');
    expect(html).not.toContain('Tenant Cooperative');
    expect(html).toContain('rgb(36,87,214)');
    expect(html).not.toContain('rgb(124,58,237)');
    expect(html).not.toMatch(VENDOR_BRANDING_REGEX);
  });

  it.runIf(Boolean(process.env.EMAIL_QA_OUTPUT_DIR))('writes representative visual QA artifacts', async () => {
    const outputDirectory = process.env.EMAIL_QA_OUTPUT_DIR;

    if (!outputDirectory) {
      return;
    }

    const element = createElement(DocumentInviteEmailTemplate, {
      assetBaseUrl: 'https://app.example.test',
      inviterEmail: 'sender@example.test',
      inviterName: 'Example Sender',
      documentName: 'Example Agreement.pdf',
      reportUrl: 'https://app.example.test/report/example',
      role: RecipientRole.SIGNER,
      signDocumentLink: 'https://app.example.test/sign/example',
    });
    const tenantBranding: BrandingSettings = {
      brandingEnabled: true,
      brandingUrl: 'https://tenant.example.test',
      brandingLogo: 'https://tenant.example.test/logo.png',
      brandingCompanyDetails: 'Tenant Cooperative\n2 Tenant Street',
      brandingHidePoweredBy: false,
      brandingColors:
        resolveEmailBrandingColors({ primary: '#7c3aed' }, getInstanceEmailBrandingColors(instanceBranding)) ??
        undefined,
    };

    const [instanceHtml, instanceText, tenantHtml] = await Promise.all([
      renderTemplate(element),
      renderTemplate(element, { plainText: true }),
      renderTemplate(element, { branding: tenantBranding }),
    ]);

    await fs.mkdir(outputDirectory, { recursive: true });
    await Promise.all([
      fs.writeFile(path.join(outputDirectory, 'instance-document-invite.html'), instanceHtml),
      fs.writeFile(path.join(outputDirectory, 'instance-document-invite.txt'), instanceText),
      fs.writeFile(path.join(outputDirectory, 'tenant-document-invite.html'), tenantHtml),
    ]);
  });
});
