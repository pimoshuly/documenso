import { Link, Outlet } from 'react-router';

import { BrandingLogo } from '~/components/general/branding-logo';
import { InstanceLegalLinks } from '~/components/general/instance-legal-links';

export default function Layout() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted px-4 py-12 md:p-12 lg:p-24">
      <div>
        <Link to="/" className="mb-8 flex justify-center">
          <BrandingLogo className="h-8 max-w-64" />
        </Link>

        <div className="relative w-full">
          <Outlet />
        </div>

        <InstanceLegalLinks className="mt-8 justify-center" />
      </div>
    </main>
  );
}
