import { colord } from 'colord';
import { z } from 'zod';

import { env } from '../utils/env';

const ROOT_RELATIVE_URL_REGEX = /^\/(?!\/)/;

const DEFAULT_INSTANCE_NAME = 'Document Signing';
const DEFAULT_INSTANCE_DESCRIPTION = 'Securely send and sign documents.';
const DEFAULT_PRIMARY_COLOR = '#334155';
const DEFAULT_PRIMARY_FOREGROUND_COLOR = '#ffffff';
const DEFAULT_LICENSE_URL = 'https://www.gnu.org/licenses/agpl-3.0.html';

export const ZSafeInstanceUrlSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (hasUnsupportedUrlCharacter(value) || value.includes('\\')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL contains unsupported characters',
      });

      return;
    }

    if (ROOT_RELATIVE_URL_REGEX.test(value)) {
      return;
    }

    const parsedUrl = URL.parse(value);

    if (!parsedUrl || (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL must use http(s) or be root-relative',
      });

      return;
    }

    if (parsedUrl.username || parsedUrl.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL credentials are not allowed',
      });
    }
  });

const ZInstanceBrandingEnvironmentSchema = z.object({
  NEXT_PUBLIC_INSTANCE_NAME: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_SHORT_NAME: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_DESCRIPTION: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_WEBSITE_URL: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_LOGO_URL: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_ICON_URL: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_OPENGRAPH_IMAGE_URL: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_PRIMARY_COLOR: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_PRIMARY_FOREGROUND_COLOR: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_LEGAL_NAME: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_LEGAL_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_EMAIL_FOOTER_TEXT: z.string().optional(),
  NEXT_PUBLIC_SOURCE_CODE_URL: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_DOCUMENTATION_URL: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_SUPPORT_URL: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_TERMS_URL: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_PRIVACY_URL: z.string().optional(),
  NEXT_PUBLIC_INSTANCE_PLANS_URL: z.string().optional(),
});

export type InstanceBrandingEnvironment = z.input<typeof ZInstanceBrandingEnvironmentSchema>;

export type InstanceBrandingConfig = Readonly<{
  name: string;
  shortName: string;
  description: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  iconUrl: string | null;
  openGraphImageUrl: string | null;
  primaryColor: string;
  primaryForegroundColor: string;
  legalName: string | null;
  legalAddress: string | null;
  supportEmail: string | null;
  emailFooterText: string | null;
  sourceCodeUrl: string | null;
  licenseUrl: string;
  documentationUrl: string | null;
  supportUrl: string | null;
  termsUrl: string | null;
  privacyUrl: string | null;
  plansUrl: string | null;
  downloadFilenamePrefix: string;
}>;

export const parseInstanceBrandingEnvironment = (input: InstanceBrandingEnvironment): InstanceBrandingConfig => {
  const environment = ZInstanceBrandingEnvironmentSchema.parse(input);

  const name = parseText(environment.NEXT_PUBLIC_INSTANCE_NAME, DEFAULT_INSTANCE_NAME, 80);
  const shortName = parseText(environment.NEXT_PUBLIC_INSTANCE_SHORT_NAME, name, 32);

  return {
    name,
    shortName,
    description: parseText(environment.NEXT_PUBLIC_INSTANCE_DESCRIPTION, DEFAULT_INSTANCE_DESCRIPTION, 240),
    websiteUrl: parseSafeUrl(environment.NEXT_PUBLIC_INSTANCE_WEBSITE_URL),
    logoUrl: parseSafeUrl(environment.NEXT_PUBLIC_INSTANCE_LOGO_URL),
    iconUrl: parseSafeUrl(environment.NEXT_PUBLIC_INSTANCE_ICON_URL),
    openGraphImageUrl: parseSafeUrl(environment.NEXT_PUBLIC_INSTANCE_OPENGRAPH_IMAGE_URL),
    primaryColor: parseColor(environment.NEXT_PUBLIC_INSTANCE_PRIMARY_COLOR, DEFAULT_PRIMARY_COLOR),
    primaryForegroundColor: parseColor(
      environment.NEXT_PUBLIC_INSTANCE_PRIMARY_FOREGROUND_COLOR,
      DEFAULT_PRIMARY_FOREGROUND_COLOR,
    ),
    legalName: parseOptionalText(environment.NEXT_PUBLIC_INSTANCE_LEGAL_NAME, 120),
    legalAddress: parseOptionalText(environment.NEXT_PUBLIC_INSTANCE_LEGAL_ADDRESS, 500),
    supportEmail: parseEmail(environment.NEXT_PUBLIC_SUPPORT_EMAIL),
    emailFooterText: parseOptionalText(environment.NEXT_PUBLIC_INSTANCE_EMAIL_FOOTER_TEXT, 500),
    sourceCodeUrl: parseSafeUrl(environment.NEXT_PUBLIC_SOURCE_CODE_URL),
    licenseUrl: DEFAULT_LICENSE_URL,
    documentationUrl: parseSafeUrl(environment.NEXT_PUBLIC_INSTANCE_DOCUMENTATION_URL),
    supportUrl: parseSafeUrl(environment.NEXT_PUBLIC_INSTANCE_SUPPORT_URL),
    termsUrl: parseSafeUrl(environment.NEXT_PUBLIC_INSTANCE_TERMS_URL),
    privacyUrl: parseSafeUrl(environment.NEXT_PUBLIC_INSTANCE_PRIVACY_URL),
    plansUrl: parseSafeUrl(environment.NEXT_PUBLIC_INSTANCE_PLANS_URL),
    downloadFilenamePrefix: toFilenamePrefix(name),
  };
};

export const getInstanceBranding = (): InstanceBrandingConfig => {
  return parseInstanceBrandingEnvironment({
    NEXT_PUBLIC_INSTANCE_NAME: env('NEXT_PUBLIC_INSTANCE_NAME'),
    NEXT_PUBLIC_INSTANCE_SHORT_NAME: env('NEXT_PUBLIC_INSTANCE_SHORT_NAME'),
    NEXT_PUBLIC_INSTANCE_DESCRIPTION: env('NEXT_PUBLIC_INSTANCE_DESCRIPTION'),
    NEXT_PUBLIC_INSTANCE_WEBSITE_URL: env('NEXT_PUBLIC_INSTANCE_WEBSITE_URL'),
    NEXT_PUBLIC_INSTANCE_LOGO_URL: env('NEXT_PUBLIC_INSTANCE_LOGO_URL'),
    NEXT_PUBLIC_INSTANCE_ICON_URL: env('NEXT_PUBLIC_INSTANCE_ICON_URL'),
    NEXT_PUBLIC_INSTANCE_OPENGRAPH_IMAGE_URL: env('NEXT_PUBLIC_INSTANCE_OPENGRAPH_IMAGE_URL'),
    NEXT_PUBLIC_INSTANCE_PRIMARY_COLOR: env('NEXT_PUBLIC_INSTANCE_PRIMARY_COLOR'),
    NEXT_PUBLIC_INSTANCE_PRIMARY_FOREGROUND_COLOR: env('NEXT_PUBLIC_INSTANCE_PRIMARY_FOREGROUND_COLOR'),
    NEXT_PUBLIC_INSTANCE_LEGAL_NAME: env('NEXT_PUBLIC_INSTANCE_LEGAL_NAME'),
    NEXT_PUBLIC_INSTANCE_LEGAL_ADDRESS: env('NEXT_PUBLIC_INSTANCE_LEGAL_ADDRESS'),
    NEXT_PUBLIC_SUPPORT_EMAIL: env('NEXT_PUBLIC_SUPPORT_EMAIL'),
    NEXT_PUBLIC_INSTANCE_EMAIL_FOOTER_TEXT: env('NEXT_PUBLIC_INSTANCE_EMAIL_FOOTER_TEXT'),
    NEXT_PUBLIC_SOURCE_CODE_URL: env('NEXT_PUBLIC_SOURCE_CODE_URL'),
    NEXT_PUBLIC_INSTANCE_DOCUMENTATION_URL: env('NEXT_PUBLIC_INSTANCE_DOCUMENTATION_URL'),
    NEXT_PUBLIC_INSTANCE_SUPPORT_URL: env('NEXT_PUBLIC_INSTANCE_SUPPORT_URL'),
    NEXT_PUBLIC_INSTANCE_TERMS_URL: env('NEXT_PUBLIC_INSTANCE_TERMS_URL'),
    NEXT_PUBLIC_INSTANCE_PRIVACY_URL: env('NEXT_PUBLIC_INSTANCE_PRIVACY_URL'),
    NEXT_PUBLIC_INSTANCE_PLANS_URL: env('NEXT_PUBLIC_INSTANCE_PLANS_URL'),
  });
};

export const resolveInstanceBrandingUrl = (
  value: string | null,
  options: { absolute?: boolean } = {},
): string | null => {
  if (!value) {
    return null;
  }

  const parsedValue = ZSafeInstanceUrlSchema.safeParse(value);

  if (!parsedValue.success) {
    return null;
  }

  if (!ROOT_RELATIVE_URL_REGEX.test(parsedValue.data)) {
    return parsedValue.data;
  }

  const basePath = (env('NEXT_PUBLIC_BASE_PATH') ?? '').replace(/\/$/, '');
  const resolvedPath = `${basePath}${parsedValue.data}`;

  if (!options.absolute) {
    return resolvedPath;
  }

  const webAppUrl = env('NEXT_PUBLIC_WEBAPP_URL') ?? 'http://localhost:3000';
  const parsedWebAppUrl = URL.parse(webAppUrl);

  if (!parsedWebAppUrl) {
    return null;
  }

  return new URL(resolvedPath, parsedWebAppUrl.origin).toString();
};

export const getInstanceBrandingCssVariables = (
  branding: InstanceBrandingConfig = getInstanceBranding(),
): Record<string, string> => {
  const primaryColor = colord(branding.primaryColor).toHsl();
  const primaryForegroundColor = colord(branding.primaryForegroundColor).toHsl();

  return {
    '--primary': `${primaryColor.h} ${primaryColor.s}% ${primaryColor.l}%`,
    '--primary-foreground': `${primaryForegroundColor.h} ${primaryForegroundColor.s}% ${primaryForegroundColor.l}%`,
    '--ring': `${primaryColor.h} ${primaryColor.s}% ${primaryColor.l}%`,
  };
};

export const formatInstanceEmailSubject = (
  subject: string,
  branding: InstanceBrandingConfig = getInstanceBranding(),
): string => {
  return `${subject} - ${branding.name}`;
};

const parseText = (value: string | undefined, fallback: string, maximumLength: number): string => {
  return parseOptionalText(value, maximumLength) ?? fallback;
};

const parseOptionalText = (value: string | undefined, maximumLength: number): string | null => {
  const normalizedValue = value?.trim().replace(/\r\n/g, '\n');

  if (!normalizedValue || hasUnsupportedTextCharacter(normalizedValue)) {
    return null;
  }

  return normalizedValue.slice(0, maximumLength);
};

const parseSafeUrl = (value: string | undefined): string | null => {
  const result = ZSafeInstanceUrlSchema.safeParse(value);

  return result.success ? result.data : null;
};

const parseColor = (value: string | undefined, fallback: string): string => {
  const parsedColor = colord(value ?? '');

  return parsedColor.isValid() ? parsedColor.toHex() : fallback;
};

const parseEmail = (value: string | undefined): string | null => {
  const result = z.string().trim().email().safeParse(value);

  return result.success ? result.data : null;
};

const toFilenamePrefix = (value: string): string => {
  const prefix = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return prefix || 'document-signing';
};

const hasUnsupportedUrlCharacter = (value: string): boolean => {
  return [...value].some((character) => {
    const characterCode = character.charCodeAt(0);

    return characterCode <= 31 || characterCode === 127;
  });
};

const hasUnsupportedTextCharacter = (value: string): boolean => {
  return [...value].some((character) => {
    const characterCode = character.charCodeAt(0);

    return (characterCode <= 31 && characterCode !== 10 && characterCode !== 13) || characterCode === 127;
  });
};
