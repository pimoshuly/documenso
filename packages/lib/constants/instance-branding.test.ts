import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  formatInstanceEmailSubject,
  getInstanceBrandingCssVariables,
  parseInstanceBrandingEnvironment,
  resolveInstanceBrandingUrl,
  ZSafeInstanceUrlSchema,
} from './instance-branding';

describe('instance branding', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses neutral defaults without vendor branding', () => {
    const branding = parseInstanceBrandingEnvironment({});

    expect(branding).toMatchObject({
      name: 'Document Signing',
      shortName: 'Document Signing',
      description: 'Securely send and sign documents.',
      websiteUrl: null,
      logoUrl: null,
      iconUrl: null,
      legalName: null,
      legalAddress: null,
      supportEmail: null,
      emailFooterText: null,
      sourceCodeUrl: null,
      downloadFilenamePrefix: 'document-signing',
    });
  });

  it('parses a complete custom configuration', () => {
    const branding = parseInstanceBrandingEnvironment({
      NEXT_PUBLIC_INSTANCE_NAME: 'Example Sign',
      NEXT_PUBLIC_INSTANCE_SHORT_NAME: 'Example',
      NEXT_PUBLIC_INSTANCE_DESCRIPTION: 'Sign documents with Example.',
      NEXT_PUBLIC_INSTANCE_WEBSITE_URL: 'https://example.com',
      NEXT_PUBLIC_INSTANCE_LOGO_URL: '/static/brand/logo.svg',
      NEXT_PUBLIC_INSTANCE_ICON_URL: 'https://cdn.example.com/icon.png',
      NEXT_PUBLIC_INSTANCE_PRIMARY_COLOR: '#123456',
      NEXT_PUBLIC_INSTANCE_PRIMARY_FOREGROUND_COLOR: '#fafafa',
      NEXT_PUBLIC_INSTANCE_LEGAL_NAME: 'Example, Inc.',
      NEXT_PUBLIC_INSTANCE_LEGAL_ADDRESS: '1 Example Street',
      NEXT_PUBLIC_SUPPORT_EMAIL: 'support@example.com',
      NEXT_PUBLIC_INSTANCE_EMAIL_FOOTER_TEXT: 'Example transactional email',
      NEXT_PUBLIC_SOURCE_CODE_URL: 'https://github.com/example/example-sign',
    });

    expect(branding).toMatchObject({
      name: 'Example Sign',
      shortName: 'Example',
      websiteUrl: 'https://example.com',
      logoUrl: '/static/brand/logo.svg',
      iconUrl: 'https://cdn.example.com/icon.png',
      primaryColor: '#123456',
      primaryForegroundColor: '#fafafa',
      legalName: 'Example, Inc.',
      legalAddress: '1 Example Street',
      supportEmail: 'support@example.com',
      sourceCodeUrl: 'https://github.com/example/example-sign',
      downloadFilenamePrefix: 'example-sign',
    });
  });

  it.each([
    'https://example.com/brand/logo.svg',
    'http://localhost:3000/static/brand/logo.svg',
    '/static/brand/logo.svg',
  ])('accepts safe URL %s', (value) => {
    expect(ZSafeInstanceUrlSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'data:image/svg+xml;base64,abc',
    'file:///tmp/logo.png',
    'ftp://example.com/logo.png',
    '//example.com/logo.png',
    'https://user:password@example.com/logo.png',
    '/static\\logo.png',
  ])('rejects unsafe URL %s', (value) => {
    expect(ZSafeInstanceUrlSchema.safeParse(value).success).toBe(false);
  });

  it('ignores invalid optional values', () => {
    const branding = parseInstanceBrandingEnvironment({
      NEXT_PUBLIC_INSTANCE_LOGO_URL: 'javascript:alert(1)',
      NEXT_PUBLIC_INSTANCE_PRIMARY_COLOR: 'not-a-color',
      NEXT_PUBLIC_SUPPORT_EMAIL: 'not-an-email',
    });

    expect(branding.logoUrl).toBeNull();
    expect(branding.primaryColor).toBe('#334155');
    expect(branding.supportEmail).toBeNull();
  });

  it('provides CSS variables from the resolved palette', () => {
    const branding = parseInstanceBrandingEnvironment({
      NEXT_PUBLIC_INSTANCE_PRIMARY_COLOR: '#334155',
      NEXT_PUBLIC_INSTANCE_PRIMARY_FOREGROUND_COLOR: '#ffffff',
    });

    expect(getInstanceBrandingCssVariables(branding)).toEqual({
      '--primary': '215 25% 27%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '215 25% 27%',
    });
  });

  it('resolves root-relative assets through the configured base path', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/signing');
    vi.stubEnv('NEXT_PUBLIC_WEBAPP_URL', 'https://sign.example.com/signing');

    expect(resolveInstanceBrandingUrl('/static/brand/logo.svg')).toBe('/signing/static/brand/logo.svg');
    expect(resolveInstanceBrandingUrl('/static/brand/logo.svg', { absolute: true })).toBe(
      'https://sign.example.com/signing/static/brand/logo.svg',
    );
  });

  it('formats email subjects with the resolved instance name', () => {
    const branding = parseInstanceBrandingEnvironment({
      NEXT_PUBLIC_INSTANCE_NAME: 'Example Sign',
    });

    expect(formatInstanceEmailSubject('Welcome', branding)).toBe('Welcome - Example Sign');
  });

  it('uses the instance name and a neutral address for sender defaults', async () => {
    vi.stubEnv('NEXT_PUBLIC_INSTANCE_NAME', 'Example Sign');
    vi.stubEnv('NEXT_PRIVATE_SMTP_FROM_NAME', '');
    vi.stubEnv('NEXT_PRIVATE_SMTP_FROM_ADDRESS', '');
    vi.resetModules();

    const { FROM_ADDRESS, FROM_NAME } = await import('./email');

    expect(FROM_NAME).toBe('Example Sign');
    expect(FROM_ADDRESS).toBe('noreply@localhost');
  });
});
