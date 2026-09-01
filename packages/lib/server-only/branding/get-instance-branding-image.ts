import fs from 'node:fs/promises';
import path from 'node:path';

import { getInstanceBranding, resolveInstanceBrandingUrl } from '../../constants/instance-branding';

const MAXIMUM_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_FETCH_TIMEOUT_MS = 5000;

let cachedImage: { url: string; bytes: Buffer | null } | null = null;

export const getInstanceBrandingImage = async (): Promise<Buffer | null> => {
  const branding = getInstanceBranding();

  if (!branding.logoUrl) {
    return null;
  }

  if (cachedImage?.url === branding.logoUrl) {
    return cachedImage.bytes;
  }

  const bytes = branding.logoUrl.startsWith('/')
    ? await readLocalBrandingImage(branding.logoUrl)
    : await fetchRemoteBrandingImage(branding.logoUrl);

  cachedImage = {
    url: branding.logoUrl,
    bytes,
  };

  return bytes;
};

const readLocalBrandingImage = async (logoUrl: string): Promise<Buffer | null> => {
  const publicDirectory = path.resolve(process.cwd(), 'public');
  const imagePath = path.resolve(publicDirectory, logoUrl.slice(1));

  if (!imagePath.startsWith(`${publicDirectory}${path.sep}`)) {
    return null;
  }

  const image = await fs.readFile(imagePath).catch(() => null);

  if (!image || image.byteLength > MAXIMUM_IMAGE_SIZE) {
    return null;
  }

  return image;
};

const fetchRemoteBrandingImage = async (logoUrl: string): Promise<Buffer | null> => {
  const resolvedLogoUrl = resolveInstanceBrandingUrl(logoUrl, { absolute: true });

  if (!resolvedLogoUrl) {
    return null;
  }

  const response = await fetch(resolvedLogoUrl, {
    signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
  }).catch(() => null);

  if (!response?.ok || !response.headers.get('content-type')?.toLowerCase().startsWith('image/')) {
    return null;
  }

  const contentLength = Number(response.headers.get('content-length') ?? '0');

  if (contentLength > MAXIMUM_IMAGE_SIZE) {
    return null;
  }

  const image = Buffer.from(await response.arrayBuffer());

  return image.byteLength <= MAXIMUM_IMAGE_SIZE ? image : null;
};
