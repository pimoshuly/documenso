import { expect, test } from '@playwright/test';

test.describe('Instance branding', () => {
  test('uses the runtime brand for metadata, navigation, manifest, and legal access', async ({ page, request }) => {
    const manifestResponse = await request.get('/api/manifest');

    expect(manifestResponse.ok()).toBeTruthy();

    const manifest = (await manifestResponse.json()) as {
      name: string;
      short_name: string;
      description: string;
      icons: { src: string }[];
    };

    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.description).toBeTruthy();
    expect(manifest.icons[0]?.src).toBeTruthy();

    await page.goto('/signin');

    await expect(page).toHaveTitle(new RegExp(manifest.name));
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /\/api\/manifest$/);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', manifest.icons[0].src);

    const configuredLogo = page.getByRole('img', { name: `${manifest.name} logo` });
    const textLogo = page.getByLabel(manifest.name, { exact: true });

    expect((await configuredLogo.count()) + (await textLogo.count())).toBeGreaterThan(0);

    await expect(page.getByRole('link', { name: 'AGPL-3.0 license' })).toBeVisible();
    await page.getByRole('link', { name: 'AGPL-3.0 license' }).click();
    await expect(page.getByRole('heading', { name: 'Source code and license' })).toBeVisible();
  });
});
