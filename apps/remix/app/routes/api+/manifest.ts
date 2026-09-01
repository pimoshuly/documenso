import { getBasePath } from '@documenso/lib/constants/app';
import { getInstanceBranding, resolveInstanceBrandingUrl } from '@documenso/lib/constants/instance-branding';

export const loader = () => {
  const branding = getInstanceBranding();
  const configuredIconUrl = resolveInstanceBrandingUrl(branding.iconUrl);
  const iconUrl = configuredIconUrl ?? `${getBasePath()}/static/brand/default-icon.svg`;
  const basePath = getBasePath();

  const manifest = {
    name: branding.name,
    short_name: branding.shortName,
    description: branding.description,
    start_url: basePath || '/',
    scope: `${basePath || ''}/`,
    display: 'standalone',
    theme_color: branding.primaryColor,
    background_color: branding.primaryForegroundColor,
    icons: [
      {
        src: iconUrl,
        sizes: 'any',
        ...(configuredIconUrl ? {} : { type: 'image/svg+xml' }),
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'application/manifest+json; charset=utf-8',
    },
  });
};
