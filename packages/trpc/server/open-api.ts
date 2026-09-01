import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';
import { getInstanceBranding } from '@documenso/lib/constants/instance-branding';
import { generateOpenApiDocument } from 'trpc-to-openapi';

import { appRouter } from './router';

const instanceBranding = getInstanceBranding();

export const openApiDocument = {
  ...generateOpenApiDocument(appRouter, {
    title: `${instanceBranding.name} v2 API`,
    description: `Welcome to the ${instanceBranding.name} v2 API.\n\nThis API provides access to this instance, which you can use to integrate applications, automate workflows, or build custom tools.`,
    version: '1.0.0',
    baseUrl: `${NEXT_PUBLIC_WEBAPP_URL()}/api/v2`,
    securitySchemes: {
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
      },
    },
  }),

  /**
   * Dirty way to pass through the security field.
   */
  security: [
    {
      apiKey: [],
    },
  ],
};
