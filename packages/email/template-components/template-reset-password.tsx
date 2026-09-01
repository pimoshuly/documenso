import { resolveInstanceBrandingUrl } from '@documenso/lib/constants/instance-branding';
import { Trans } from '@lingui/react/macro';

import { Button, Section, Text } from '../components';
import { TemplateDocumentImage } from './template-document-image';

export interface TemplateResetPasswordProps {
  userName: string;
  userEmail: string;
  assetBaseUrl: string;
}

export const TemplateResetPassword = ({ assetBaseUrl }: TemplateResetPasswordProps) => {
  const signInUrl = resolveInstanceBrandingUrl('/signin', { absolute: true });

  return (
    <>
      <TemplateDocumentImage className="mt-6" assetBaseUrl={assetBaseUrl} />

      <Section className="flex-row items-center justify-center">
        <Text className="mx-auto mb-0 max-w-[80%] text-center font-semibold text-foreground text-lg">
          <Trans>Password updated!</Trans>
        </Text>

        <Text className="my-1 text-center text-base text-muted-foreground">
          <Trans>Your password has been updated.</Trans>
        </Text>

        <Section className="mt-8 mb-6 text-center">
          {signInUrl && (
            <Button
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-center font-medium text-primary-foreground text-sm no-underline"
              href={signInUrl}
            >
              <Trans>Sign In</Trans>
            </Button>
          )}
        </Section>
      </Section>
    </>
  );
};

export default TemplateResetPassword;
