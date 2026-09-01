import { getInstanceBranding, resolveInstanceBrandingUrl } from '@documenso/lib/constants/instance-branding';
import { i18n, type MessageDescriptor } from '@lingui/core';

export const appMetaTags = (title?: MessageDescriptor) => {
  const branding = getInstanceBranding();
  const openGraphImageUrl = resolveInstanceBrandingUrl(branding.openGraphImageUrl, { absolute: true });

  const tags = [
    {
      title: title ? `${i18n._(title)} - ${branding.name}` : branding.name,
    },
    {
      name: 'description',
      content: branding.description,
    },
    {
      name: 'author',
      content: branding.legalName ?? branding.name,
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
    {
      property: 'og:title',
      content: branding.name,
    },
    {
      property: 'og:description',
      content: branding.description,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:description',
      content: branding.description,
    },
  ];

  if (openGraphImageUrl) {
    tags.push(
      {
        property: 'og:image',
        content: openGraphImageUrl,
      },
      {
        name: 'twitter:image',
        content: openGraphImageUrl,
      },
    );
  }

  return tags;
};
