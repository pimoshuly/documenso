import { NEXT_PUBLIC_WEBAPP_URL } from '../constants/app';
import { PASSKEY_TIMEOUT } from '../constants/auth';
import { getInstanceBranding } from '../constants/instance-branding';

/**
 * Extracts common fields to identify the RP (relying party)
 */
export const getAuthenticatorOptions = () => {
  const webAppBaseUrl = new URL(NEXT_PUBLIC_WEBAPP_URL());
  const rpId = webAppBaseUrl.hostname;
  const branding = getInstanceBranding();

  return {
    rpName: branding.name,
    rpId,
    origin: NEXT_PUBLIC_WEBAPP_URL(),
    timeout: PASSKEY_TIMEOUT,
  };
};
