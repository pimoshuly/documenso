import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';
import { getInstanceBranding } from '@documenso/lib/constants/instance-branding';
import { generateOpenApi } from '@ts-rest/open-api';

import { ApiContractV1 } from './contract';

const instanceBranding = getInstanceBranding();

export const OpenAPIV1 = Object.assign(
  generateOpenApi(
    ApiContractV1,
    {
      info: {
        title: `${instanceBranding.name} API`,
        version: '1.0.0',
        description: `API V1 has been deprecated. For more details, see https://docs.documenso.com/docs/developers/api/migrate-to-envelopes. \n\nThe ${instanceBranding.name} API for retrieving, creating, updating and deleting documents.`,
      },
      servers: [
        {
          url: NEXT_PUBLIC_WEBAPP_URL(),
        },
      ],
    },
    {
      setOperationId: true,
    },
  ),
  {
    components: {
      securitySchemes: {
        authorization: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
        },
      },
    },
    security: [
      {
        authorization: [],
      },
    ],
  },
);
