# Instance Branding Implementation Plan

## Status and scope

This plan was prepared on `custom/instance-branding` at Documenso v2.17.0 commit
`75330166cc00b29c14399bc2e391e4b4d8080c00`.

The implementation will add instance-level branding to the AGPL/Community Edition side of the
repository. It will not enable, copy, or modify Enterprise Edition behavior. In particular, it will
not change anything under `packages/ee/`, modify license validation, provision claims, change paid
feature flags, or set `hidePoweredBy`.

The intended result is configuration-based presentation branding, not an internal product rename.
Package scopes, database and migration identifiers, protocol headers, telemetry identifiers, Docker
image names, and upstream maintenance links remain Documenso identifiers.

## Decisions

- Add one universal, typed instance-brand configuration module at
  `packages/lib/constants/instance-branding.ts`.
- Use only public environment variables for values that reach the browser. Do not copy private
  values into the branding object or `window.__ENV__`.
- Resolve the instance brand at runtime so the same container image can be configured without a
  frontend rebuild.
- Use neutral presentation defaults. If no logo or social image is configured, render accessible
  text or omit the image metadata instead of falling back to a Documenso trademark asset.
- Require `NEXT_PUBLIC_SOURCE_CODE_URL` for production deployments. This URL must identify the
  corresponding source for the deployed modified version, not merely the unmodified upstream
  repository.
- Preserve the current organisation/team branding and claim checks. An already-authorized tenant
  value may override an instance value only on a surface where that override is already supported.
- Keep source and license access separate from “Powered by” output. A legitimate `hidePoweredBy`
  claim may continue to hide product attribution, but must never hide the source/license location.
- Keep legal notices, Enterprise licensing text, upstream project documentation, API migration
  links, and third-party notices unchanged.

## Audit method and baseline findings

The audit used `rg` for textual matches and direct inspection for every narrowed match. The search
covered `Documenso`, `documenso.com`, `documen.so`, `@documenso` without a following package path,
“powered by”, the vendor mailing address, lowercase filename prefixes, and logo/metadata asset
references. Binary logo, favicon, Open Graph, and background files were inspected separately.

The broad search touched 1,718 files because `@documenso/*` imports and workspace package names are
pervasive. Those imports are internal identifiers, not branding work. After narrowing, 72 non-test
runtime/source/asset files contained display-case `Documenso` before classification. The English
Lingui catalog has 40 brand-bearing message IDs, replicated across 11 locale catalogs. The public
documentation application contains 795 matches in 124 files; these describe the upstream product
and are not application-instance branding strings.

The deployed binary asset review confirmed that the current wordmark/icon, favicons, PWA icons,
Open Graph image, share-card frame, and authentication/error background all carry Documenso visual
identity.

## Inventory and classification

### Email content and email preview

| Surface | Current references | Planned treatment |
| --- | --- | --- |
| Shared logo | `packages/email/template-components/template-branding-logo.tsx` falls back to `/static/logo.png` and “Documenso Logo” | Resolve authorized tenant logo first, then instance logo, then accessible instance-name text. |
| Shared footer | `packages/email/template-components/template-footer.tsx` contains Documenso name, mail-footer URL, legal name, and San Francisco address | Use instance name, website, legal name, and mailing address. Keep the existing tenant company-details override and `brandingHidePoweredBy` behavior. |
| Email context | `packages/email/providers/branding.tsx`, `packages/email/render.tsx`, `packages/lib/utils/team-global-settings-to-branding.ts`, and `packages/lib/server-only/email/get-email-context.ts` | Carry instance defaults separately from tenant settings. Do not turn `brandingEnabled` on to represent instance branding. |
| Sender defaults | `packages/lib/constants/email.ts`, `packages/lib/server-only/auth/send-forgot-password.ts`, and `packages/lib/server-only/auth/send-reset-password.ts` | Continue honoring SMTP variables; fall back to instance name and a neutral local address, not a vendor address. Production docs continue to require a real sender address. |
| Body/preview copy | `template-admin-user-created.tsx`, `template-confirmation-email.tsx`, `confirm-team-email.tsx`, `organisation-account-link-confirmation.tsx`, `organisation-invite.tsx`, `organisation-join.tsx`, `organisation-leave.tsx`, and `team-email-removed.tsx` | Interpolate the instance name and configured support contact through Lingui messages. |
| Subject copy | `send-admin-user-created-email.handler.ts`, `create-organisation-member-invites.ts`, `create-team-email-verification.ts`, and `delete-team.ts` | Interpolate the instance name without changing recipient, sender, or entitlement logic. |
| Marketing links | `template-document-self-signed.tsx` and recipient email footers link to Documenso pricing/site pages | Use configured instance website/plans URLs; omit an optional plans CTA when no plans URL is configured. |
| Preview fixtures | `packages/email/preview/app/lib/templates.tsx` and template default props use Documenso names, domains, and addresses | Use instance configuration for brand output and `example.com` for sample people/URLs. |
| Direct logo exception | `packages/email/templates/admin-user-created.tsx` bypasses `TemplateBrandingLogo` | Route it through the shared logo component. |

Internal email headers such as `X-Documenso-Sender-User-Id` and package imports remain unchanged for
compatibility. The legacy/sentinel email identifiers used by migrations and document/template
placeholder logic also remain unchanged.

### Web UI, authentication, signing, navigation, and errors

The shared vendor SVGs live in:

- `apps/remix/app/components/general/branding-logo.tsx`
- `apps/remix/app/components/general/branding-logo-icon.tsx`

They are used by the authenticated header, mobile navigation, public profiles, envelope editor,
recipient signing headers, embedded authentication, embedded signing, multisign, and HTML-to-PDF
routes. These components should retain their exported names to minimize upstream diff noise, but
their implementation should render configured instance images or neutral instance-name/icon
fallbacks.

User-visible application copy that refers to the running instance occurs in:

- `apps/remix/app/components/dialogs/account-delete-dialog.tsx`
- `apps/remix/app/components/dialogs/envelope-distribute-dialog.tsx`
- `apps/remix/app/components/dialogs/token-create-dialog.tsx`
- `apps/remix/app/components/dialogs/webhook-create-dialog.tsx`
- `apps/remix/app/components/dialogs/webhook-edit-dialog.tsx`
- `apps/remix/app/components/embed/embed-document-completed.tsx`
- `apps/remix/app/components/general/document/document-certificate-qr-view.tsx`
- `apps/remix/app/components/general/envelope-editor/envelope-editor-settings-dialog.tsx`
- `apps/remix/app/routes/_profile+/p.$url.tsx`
- `apps/remix/app/routes/_recipient+/_layout.tsx`
- `apps/remix/app/routes/_recipient+/sign.$token+/_index.tsx`
- `apps/remix/app/routes/_unauthenticated+/articles.signature-disclosure.tsx`
- `apps/remix/app/routes/_unauthenticated+/o.$orgUrl.signin.tsx`
- `apps/remix/app/routes/_unauthenticated+/organisation.invite.$token.tsx`
- `apps/remix/app/routes/_unauthenticated+/verify-email.$token.tsx`
- `packages/ui/primitives/document-flow/add-subject.tsx`
- `packages/ui/primitives/template-flow/add-template-settings.tsx`

These strings should use the instance name or neutral wording such as “this instance.” Brand names
inside translatable sentences should be runtime interpolation values, not new hardcoded message
IDs.

“Powered by” output exists in the V1/V2 signing components, direct templates, multisign, and embed
components. The condition remains the existing `hidePoweredBy` value. When shown, the badge uses
the instance name/logo and safe instance website URL. It does not create or alter a claim.

The signup preview currently shows Documenso co-founder Timur Ercan and a vendor profile asset via
`apps/remix/app/components/general/user-profile-timur.tsx`. The instance build should use the
existing generic `UserProfileSkeleton` (or a neutral example) instead. The upstream founder asset
may remain in `packages/assets/` as an unused upstream asset.

Lowercase strings in downloadable filenames are user-visible and should use a sanitized slug
derived from the instance name:

- `apps/remix/app/components/dialogs/organisation-member-invite-dialog.tsx`
- `apps/remix/app/components/dialogs/envelopes-bulk-download-dialog.tsx`
- `apps/remix/app/components/forms/2fa/enable-authenticator-app-dialog.tsx`
- `apps/remix/app/components/forms/2fa/view-recovery-codes-dialog.tsx`

CSS classes such as `text-documenso-700`, `bg-documenso`, and `.documenso-branded` are internal
design-system/sanitization identifiers and remain unchanged.

### Authentication display names

The following are visible to users outside normal page copy and must use the instance name:

- WebAuthn RP display name in `packages/lib/utils/authenticator.ts`.
- Authenticator-app TOTP issuer in `packages/lib/server-only/2fa/setup-2fa.ts`.
- Email 2FA issuer in `packages/lib/server-only/2fa/email/generate-2fa-credentials-from-email.ts`.
- Email transport test subject in
  `packages/trpc/server/admin-router/email-transport/send-test-email-transport.ts`.

The WebAuthn RP ID and origin remain derived from `NEXT_PUBLIC_WEBAPP_URL`. Changing only `rpName`
does not change credential scope.

### Metadata, manifest, favicon, Open Graph, social, and OpenAPI

| Surface | Files | Planned treatment |
| --- | --- | --- |
| Page metadata | `apps/remix/app/utils/meta.ts` | Use instance name, description, legal name, optional OG image, and optional social handle. Omit optional tags when unset. |
| Root head/runtime env | `apps/remix/app/root.tsx` | Emit configured icon links, dynamic manifest URL, instance color variables, and public environment only. |
| Static manifest | `apps/remix/public/site.webmanifest`, `packages/assets/site.webmanifest` | Stop serving the static vendor manifest. Add a runtime resource response at `/api/manifest` so name, short name, icon, and theme color follow environment configuration. Keep the package copy only as an unused upstream asset if another package still needs it. |
| Share metadata | `apps/remix/app/routes/_share+/share.$slug.tsx` | Use instance name, website, description, and optional social handle. |
| Share image | `apps/remix/app/routes/_share+/share.$slug.opengraph.tsx` | Render a neutral frame dynamically with instance name/logo/color; stop using the baked vendor share frame. |
| OpenAPI | `packages/api/v1/openapi.ts`, `packages/trpc/server/open-api.ts` | Use `${instanceName} API` and neutral descriptions. Keep official Documenso migration-document links because they document upstream API behavior. |
| V1 docs redirect | `packages/api/hono.ts` | Keep the official deprecated V1 OpenAPI redirect unless a separately hosted instance API reference is introduced. It is an operational upstream link, not instance branding. |

Vendor-branded files currently deployed from `apps/remix/public/` and no longer referenced after the
runtime conversion should be removed from the deploy surface:

- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `apple-touch-icon.png`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon.ico`
- `opengraph-image.jpg`
- `site.webmanifest`
- `static/logo.png`
- `static/og-share-frame2.png`

`packages/assets/logo.png`, `logo_icon.png`, the duplicate favicon/manifest files,
`static/logo.png`, `static/og-share-frame*.png`, `opengraph-image.jpg`, and
`images/background-pattern.png` are upstream assets. Runtime imports should stop, but the package
files do not need to be renamed or deleted unless the package is later republished as a branded
artifact. The unauthenticated and error layouts should use neutral CSS backgrounds rather than the
vendor-emblem background image.

### Certificate, audit-log PDF, and signature output

There are two active certificate/audit-log rendering paths and both must be updated:

- HTML/Playwright routes:
  - `apps/remix/app/routes/_internal+/[__htmltopdf]+/audit-log.tsx`
  - `apps/remix/app/routes/_internal+/[__htmltopdf]+/certificate.tsx`
- Konva/Skia renderers:
  - `packages/lib/server-only/pdf/render-audit-logs.ts`
  - `packages/lib/server-only/pdf/render-certificate.ts`

Both currently render the Documenso logo from `public/static/logo.png`. They should accept the
resolved instance brand as an explicit dependency and render the configured logo or instance-name
text fallback. The existing `hidePoweredBy` condition remains unchanged and continues to control
only the attribution block. No organisation/team logo should be added to PDF output because the
current PDF paths do not support that override.

`packages/signing/index.ts` currently writes “Signed by Documenso” into the cryptographic PDF
signature properties. It should use `Signed by ${instanceName}` while preserving the existing
location, contact, signer, subfilter, timestamp, and certificate behavior.

Placeholder addresses in `packages/lib/server-only/pdf/helpers.ts` are internal document-model
sentinels and remain unchanged.

### Operational logs and public documentation

- `packages/lib/server-only/telemetry/telemetry-client.ts` must retain Documenso wording and the
  official telemetry documentation URL because telemetry is sent to the upstream vendor. Rebranding
  this log would misidentify the data recipient.
- `docker/start.sh` may use `NEXT_PUBLIC_INSTANCE_NAME` for “Starting …” messages, while its
  Documenso documentation/community links remain official maintenance links.
- `README.md`, `apps/docs/`, `docker/README.md`, `.github/`, `.agents/`, `.devcontainer/`, and
  `.well-known/security.txt` describe or maintain the upstream project and remain unchanged except
  for adding the new environment-variable reference to the self-hosting documentation.
- The 795 brand matches in `apps/docs/` are public upstream product documentation, not runtime
  instance copy. They are explicitly excluded from mass replacement.

### Internal identifiers that remain unchanged

- All `@documenso/*` npm scopes, imports, workspace names, TypeScript aliases, and published SDK
  names.
- Prisma schema names, migrations, migration history, seed conventions, and legacy service-account
  addresses.
- Template/direct-link placeholder addresses and regexes, including `recipient.N@documenso.com` and
  `direct.link@documenso.com`, because they are persisted protocol identifiers.
- `X-Documenso-*` email/webhook headers and other public integration headers.
- `.documenso-*` license/telemetry filenames, `documenso-jobs`, Inngest IDs, Redis prefixes, and
  Docker service/image/database defaults.
- `.documenso-branded`, `documenso-*` Tailwind color classes, and the branding CSS sanitizer scope.
- Official source, issue, API migration, documentation, telemetry, license-server, Docker image,
  and Enterprise sales links used for maintenance or the actual vendor service.
- `DOCUMENSO_CLOUD_*`, `IS_DOCUMENSO_CLOUD`, license schema names, claim keys, and paid feature
  labels.

### Copyright, license, attribution, and third-party notices

The following remain byte-for-byte unchanged:

- Root `LICENSE` (AGPL-3.0).
- `packages/ee/LICENSE` and `packages/ee/FEATURES`.
- Copyright statements in those files and existing source notices.
- Third-party license/attribution files.
- Documenso references that identify the original project or commercial licensor on the new license
  page.

## Configuration design

### Module and public type

Create `packages/lib/constants/instance-branding.ts` with a single source of truth for parsing,
normalization, neutral defaults, URL resolution, and derived values.

```ts
type InstanceBrandingConfig = Readonly<{
  name: string;
  shortName: string;
  legalName: string | null;
  legalAddress: string | null;
  description: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  iconUrl: string | null;
  openGraphImageUrl: string | null;
  primaryColor: string;
  primaryForegroundColor: string;
  documentationUrl: string | null;
  supportUrl: string | null;
  supportEmail: string | null;
  termsUrl: string | null;
  privacyUrl: string | null;
  plansUrl: string | null;
  sourceCodeUrl: string | null;
  licenseUrl: string;
  downloadFilenamePrefix: string;
}>;
```

The module should export:

- `ZSafeInstanceUrlSchema`.
- A pure `parseInstanceBrandingEnvironment(input)` function for focused tests.
- `getInstanceBranding()` for server, browser, React Email, PDF, WebAuthn, and metadata callers.
- `resolveInstanceBrandingUrl(value, { absolute })` to preserve base-path hosting and make email/PDF
  asset URLs absolute.
- A deterministic filename slug derived from `name`, with `document-signing` as the neutral
  fallback.

Do not add a second independent branding constants object in Remix or Email. Output-specific
components may adapt the shared type, but they do not re-read or re-validate environment variables.

### Environment keys

| Variable | Requirement | Neutral fallback / behavior |
| --- | --- | --- |
| `NEXT_PUBLIC_INSTANCE_NAME` | Optional | `Document Signing` |
| `NEXT_PUBLIC_INSTANCE_SHORT_NAME` | Optional | Instance name, length-limited for the manifest |
| `NEXT_PUBLIC_INSTANCE_LEGAL_NAME` | Optional | Omit the legal-name block |
| `NEXT_PUBLIC_INSTANCE_LEGAL_ADDRESS` | Optional | Omit the address block; deployment docs warn operators to configure any legally required postal address |
| `NEXT_PUBLIC_INSTANCE_DESCRIPTION` | Optional | `Securely send and sign documents.` |
| `NEXT_PUBLIC_INSTANCE_WEBSITE_URL` | Optional | Omit optional website links |
| `NEXT_PUBLIC_INSTANCE_LOGO_URL` | Optional | No image; render accessible instance-name text |
| `NEXT_PUBLIC_INSTANCE_ICON_URL` | Optional | Omit favicon/PWA icons and use the browser default |
| `NEXT_PUBLIC_INSTANCE_OPENGRAPH_IMAGE_URL` | Optional | Omit general OG/Twitter image tags; the share route renders its own neutral dynamic card |
| `NEXT_PUBLIC_INSTANCE_PRIMARY_COLOR` | Optional | Neutral slate color such as `#334155` |
| `NEXT_PUBLIC_INSTANCE_PRIMARY_FOREGROUND_COLOR` | Optional | `#ffffff` |
| `NEXT_PUBLIC_INSTANCE_DOCUMENTATION_URL` | Optional | Hide the instance documentation card; do not substitute upstream docs silently |
| `NEXT_PUBLIC_INSTANCE_SUPPORT_URL` | Optional | Hide the support URL action |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Optional but recommended | No mail link when unset; SMTP sender configuration remains separate |
| `NEXT_PUBLIC_INSTANCE_TERMS_URL` | Optional but recommended when public signup is enabled | Omit the terms link when unset and surface a deployment warning |
| `NEXT_PUBLIC_INSTANCE_PRIVACY_URL` | Optional but recommended when public signup is enabled | Omit the privacy link when unset and surface a deployment warning |
| `NEXT_PUBLIC_INSTANCE_PLANS_URL` | Optional | Omit instance plans CTAs; do not substitute Documenso pricing |
| `NEXT_PUBLIC_SOURCE_CODE_URL` | Required in production | No production fallback; must point to the corresponding modified source |

All keys are intentionally public. No logo, address, support, or legal value may be sourced from a
`NEXT_PRIVATE_*` variable and then injected into the browser.

### Validation rules

- Trim text, reject control characters, and cap lengths appropriate to metadata/email output.
- Validate colors with `colord`; invalid colors use neutral defaults.
- A safe public URL is either:
  - an absolute `http:` or `https:` URL without embedded username/password; or
  - a single-leading-slash root-relative path.
- Reject `javascript:`, `data:`, `file:`, `ftp:`, protocol-relative `//host`, backslashes, control
  characters, and malformed URLs.
- Resolve a root-relative path through `NEXT_PUBLIC_BASE_PATH` for browser output. Resolve it against
  the public web-app origin plus base path for email/PDF output.
- Invalid optional values are ignored with a server-side warning that names only the variable, not
  any potentially sensitive value.
- Production startup validation fails clearly when `NEXT_PUBLIC_SOURCE_CODE_URL` is missing or
  unsafe. Development/test uses an explicit test value rather than silently claiming the upstream
  source is the modified source.

### Data flow

```text
process.env NEXT_PUBLIC_INSTANCE_* / NEXT_PUBLIC_SOURCE_CODE_URL
                         |
                         v
  packages/lib/constants/instance-branding.ts
       parse + validate + neutral fallback + URL resolution
         |            |              |              |
         |            |              |              +--> WebAuthn/TOTP/OpenAPI/signature reason
         |            |              +-----------------> React Email provider/templates
         |            +--------------------------------> PDF HTML + Konva/Skia renderers
         +--> createPublicEnv() --> SSR + window.__ENV__ --> UI/meta/manifest/share cards
```

`createPublicEnv()` already exports all `NEXT_PUBLIC_*` values. Add type declarations and tests, but
do not introduce a private-to-public copy path.

## Branding precedence and licensing behavior

| Surface | First choice | Fallback | Claim behavior |
| --- | --- | --- | --- |
| Global application header, auth, errors, metadata, manifest | Instance brand | Neutral text/no optional image | No organisation/team override exists today, so none is added. |
| Recipient signing header | Existing authorized team/organisation logo | Instance logo/name | Existing settings/claim resolution remains authoritative. |
| Recipient colors/CSS | Existing authorized tenant colors/CSS | Instance primary colors | `loadRecipientBrandingByTeamId` and its license checks remain unchanged. |
| Email logo/colors/company details | Existing authorized tenant values | Instance values | Existing `brandingEnabled`, inherited settings, and claim checks remain unchanged. |
| “Powered by” badges/email sentence | Instance name/logo when visible | Instance name text | Existing `hidePoweredBy` controls visibility; no flag is set or inferred. |
| PDF certificate/audit attribution | Instance logo/name | Instance name text | Existing `hidePoweredBy` controls visibility. No new tenant override is added. |
| Source/license links | Instance source and AGPL license | Production configuration is required | Never controlled by `hidePoweredBy` or branding claims. |

Instance branding must not be represented by setting tenant `brandingEnabled`,
`embedSigningWhiteLabel`, or `hidePoweredBy`. The instance layer is a separate fallback layer.

## Implementation phases and exact files

### 1. Add the configuration core and deployment wiring

Create:

- `packages/lib/constants/instance-branding.ts`
- `packages/lib/constants/instance-branding.test.ts`

Update:

- `packages/tsconfig/process-env.d.ts`
- `packages/lib/constants/app.ts`
- `packages/lib/constants/email.ts`
- `packages/lib/utils/env.ts` tests or a new `packages/lib/utils/env.test.ts`
- `.env.example`
- `turbo.json`
- `docker/production/compose.yml`
- `render.yaml`
- `apps/docs/content/docs/self-hosting/configuration/environment.mdx`
- `docker/start.sh` for instance-name startup text only

No Dockerfile build arguments are required: the configuration is read at runtime and passed through
SSR. Root-relative custom assets still need to exist in the image/public mount or be served by a
reverse proxy.

### 2. Replace shared web branding and add legal/source access

Create:

- `apps/remix/app/components/general/instance-legal-links.tsx`
- `apps/remix/app/routes/_unauthenticated+/articles.license.tsx`
- `apps/remix/app/routes/api+/manifest.ts`

Update:

- `apps/remix/app/components/general/branding-logo.tsx`
- `apps/remix/app/components/general/branding-logo-icon.tsx`
- `apps/remix/app/components/general/app-nav-mobile.tsx`
- `apps/remix/app/components/general/org-menu-switcher.tsx`
- `apps/remix/app/components/general/generic-error-layout.tsx`
- `apps/remix/app/routes/_unauthenticated+/_layout.tsx`
- `apps/remix/app/routes/_profile+/_layout.tsx`
- `apps/remix/app/root.tsx`
- `apps/remix/app/utils/meta.ts`

The license page must identify Documenso as the original project, state that the instance is a
modified AGPL-3.0 version, retain the no-warranty/license notice, link to the configured
corresponding source, and link to the license text. Add “Source code” and “License” entries to the
authenticated menus and unauthenticated/error layouts.

Add the same legal location to anonymous signing/embed surfaces independently of the powered-by
condition:

- `apps/remix/app/components/general/document-signing/document-signing-mobile-widget.tsx`
- `apps/remix/app/components/general/document-signing/document-signing-page-view-v2.tsx`
- `apps/remix/app/components/embed/embed-direct-template-client-page.tsx`
- `apps/remix/app/components/embed/embed-document-signing-page-v1.tsx`
- `apps/remix/app/routes/embed+/v1+/multisign+/_index.tsx`

### 3. Convert application copy and user-visible filenames

Update the running-instance references listed in the web inventory. Also update:

- `apps/remix/app/components/forms/signup.tsx` for configured terms/privacy links and neutral profile
  preview.
- `apps/remix/app/components/general/admin-license-status-banner.tsx` to say “this instance” while
  keeping official licensing links and behavior.
- `apps/remix/app/components/general/organisations/organisation-billing-banner.tsx` to interpolate
  the instance name without changing billing logic.
- `apps/remix/app/components/general/settings-upsell/branding-upsell.tsx` and
  `email-domains-upsell.tsx` so the unbranded/default preview uses the instance brand. Enterprise
  labels, entitlements, and official sales CTA remain unchanged.
- The four user-visible download filename call sites identified above.

Do not alter `packages/lib/types/subscription.ts`, claim schemas, license code, or paid flags.

### 4. Update email rendering and preview

Update:

- `packages/email/providers/branding.tsx`
- `packages/email/render.tsx`
- `packages/email/template-components/template-branding-logo.tsx`
- `packages/email/template-components/template-footer.tsx`
- `packages/email/template-components/template-admin-user-created.tsx`
- `packages/email/template-components/template-confirmation-email.tsx`
- `packages/email/template-components/template-document-image.tsx`
- `packages/email/template-components/template-document-self-signed.tsx`
- `packages/email/templates/admin-user-created.tsx`
- `packages/email/templates/confirm-team-email.tsx`
- `packages/email/templates/organisation-account-link-confirmation.tsx`
- `packages/email/templates/organisation-invite.tsx`
- `packages/email/templates/organisation-join.tsx`
- `packages/email/templates/organisation-leave.tsx`
- `packages/email/templates/team-email-removed.tsx`
- `packages/email/templates/reset-password.tsx`
- `packages/email/preview/app/lib/templates.tsx`
- `packages/email/preview/app/routes/api.render.tsx`
- `packages/lib/utils/team-global-settings-to-branding.ts`
- `packages/lib/utils/email-branding-colors.ts`
- `packages/lib/server-only/email/get-email-context.ts`
- The four subject-producing server files identified in the email inventory.

Extend the Email branding context with a distinct `instance` field. Keep tenant fields and
`brandingHidePoweredBy` unchanged. Tests may inject an `InstanceBrandingConfig`; production render
calls use the shared module by default.

When tenant colors are legitimately available, merge them over instance email colors. Missing
tenant tokens inherit the instance palette, not hardcoded vendor colors. When tenant branding is
unavailable, email logo, name, website, support, legal name, mailing address, and colors all come
from the instance configuration.

Replace preview-only names/addresses/URLs with `Example Organisation`, `example.com`, and the parsed
instance values. Do not hand-edit translations before changing source messages.

### 5. Update share metadata, manifest, static assets, and OpenAPI

Update:

- `apps/remix/app/routes/_share+/share.$slug.tsx`
- `apps/remix/app/routes/_share+/share.$slug.opengraph.tsx`
- `packages/ui/components/document/document-share-button.tsx`
- `packages/api/v1/openapi.ts`
- `packages/trpc/server/open-api.ts`

The share-card route should draw its neutral layout in Satori and render an optional configured
logo. It must not fetch an unsafe URL. When a remote logo is used, impose a timeout, response-size
limit, and image content-type check before converting it to a data URL. Cache the stable result for
the process lifetime.

After all references have migrated, remove the vendor-branded deployed files listed in the asset
inventory. Keep generic email/document illustrations that contain no vendor mark.

### 6. Update PDF and signing output

Update:

- `apps/remix/app/routes/_internal+/[__htmltopdf]+/audit-log.tsx`
- `apps/remix/app/routes/_internal+/[__htmltopdf]+/certificate.tsx`
- `packages/lib/server-only/pdf/render-audit-logs.ts`
- `packages/lib/server-only/pdf/render-certificate.ts`
- `packages/lib/server-only/pdf/generate-audit-log-pdf.ts`
- `packages/lib/server-only/pdf/generate-certificate-pdf.ts`
- `packages/signing/index.ts`

Add a small server-only image loader outside `packages/ee/` for PDF/share rendering. It should use
the shared safe URL parser, resolve root-relative assets through the internal/public app base,
enforce timeout/size/content-type limits, and return `null` so renderers can fall back to text. Do
not use arbitrary user-provided URLs or credentials.

Keep the two PDF implementations visually equivalent and cover both with tests. Do not change QR
destinations, certificate contents, audit events, signing certificates, timestamps, or
`hidePoweredBy` evaluation.

### 7. Extract translations and update focused tests

Run `npm run translate:extract` after source strings use instance-name interpolation, then
`npm run translate:compile`. The extraction will replace the 40 brand-specific English message IDs
with neutral/interpolated messages across all 11 locale catalogs. Do not mechanically substitute
inside existing translations; new messages require translation review and may fall back to English
until translated.

Likely test files:

- New `packages/email/template-components/template-branding-logo.test.tsx`.
- New `packages/email/template-components/template-footer.test.tsx`.
- Update `packages/email/package.json` with a focused Vitest script if email tests cannot run through
  the existing library test setup.
- Update `packages/app-tests/e2e/signing-branding.spec.ts`.
- New `packages/app-tests/e2e/instance-branding.spec.ts`.
- Extend `packages/app-tests/e2e/features/include-document-certificate.spec.ts` or add a focused PDF
  branding spec.
- Update `packages/app-tests/e2e/webhooks/webhooks-crud.spec.ts` and other tests that assert changed
  user-visible strings.

## Test matrix

| Area | Cases |
| --- | --- |
| Parser | Neutral defaults; trimming/length bounds; required production source URL; no private values. |
| Safe URL | Accept `https://`, `http://`, and `/local/path`; preserve base path; reject unsafe schemes, `//`, credentials, controls, backslashes, and malformed values. |
| Browser/SSR | Same name/logo markup before and after hydration; no `NEXT_PRIVATE_*` value in HTML; base-path deployments resolve local assets correctly. |
| Header/auth/error | Configured logo and text fallback; mobile/desktop accessibility names; neutral background; source/license links available. |
| Metadata/manifest | Title, description, author, icon, theme color, optional OG/social tags, and `/api/manifest` response. |
| WebAuthn/TOTP | RP ID/origin unchanged; RP display name and TOTP issuers use instance name. |
| Email default | Instance logo/name/website/legal details/support/sender fallback appear in HTML and text output; no vendor address/domain. |
| Email precedence | Authorized organisation/team logo/colors/details override instance defaults; disabled/unavailable tenant branding falls back to instance; `brandingHidePoweredBy` behavior is unchanged. |
| Email safety | Unsafe brand URLs are omitted; root-relative logo is absolute in rendered email; preview uses the same pipeline. |
| Signing/embed | Instance fallback appears; existing tenant logo remains a plain image where currently required; Brand Website is not introduced on tenant signing logos; powered-by claim behavior is unchanged; source/license links remain. |
| Share/social | Instance copy/handle, neutral generated card, configured website redirect, and no vendor frame. |
| OpenAPI | V1/V2 titles and introductions use instance name; official migration links remain. |
| PDF | HTML and Konva audit/certificate paths render configured logo or text fallback; QR links unchanged; authorized `hidePoweredBy` still removes attribution only. |
| Signed PDF | Signature reason uses instance name; cryptographic signer, contact, timestamp, and subfilter are unchanged. |
| Downloads | CSV/ZIP/recovery-code filenames use a safe derived prefix. |
| Legal | `/articles/license` is public, source URL matches deployment configuration, license link works, and no brand/claim flag hides it. |

Verification should use focused commands and must not use the full repository build unless it is
explicitly requested:

```bash
npm test -w @documenso/lib
npm test -w @documenso/email
npm run typecheck -w @documenso/remix
npm run translate:extract
npm run translate:compile
npm run lint
E2E_TEST_PATH=e2e/instance-branding.spec.ts npm run test:dev -w @documenso/app-tests
E2E_TEST_PATH=e2e/signing-branding.spec.ts npm run test:dev -w @documenso/app-tests
```

## Final user-visible string and asset scan

Add `scripts/check-instance-branding.ts` and a root `check:instance-branding` script. The check should
run `rg` over tracked text files for case-insensitive `documenso`, both vendor domains, the vendor
address, vendor social handle, and powered-by text. It should fail on every match not covered by an
explicit path-and-pattern allowlist with a reason.

Allowlist categories:

| Allowlist | Exact scope/reason |
| --- | --- |
| Legal | `LICENSE`, `packages/ee/LICENSE`, `packages/ee/FEATURES`, third-party notices, and original-project attribution on `articles.license.tsx`. |
| Public upstream docs | `README.md`, `apps/docs/**`, `docker/README.md`, `.github/**`, `.agents/**`, `.devcontainer/**`, `.well-known/security.txt`. |
| Package identity | `package.json`, lockfile entries, `@documenso/*` imports/aliases, package names, and official SDK names. |
| Database/history | `packages/prisma/migrations/**`, seed/test fixtures, legacy service-account addresses, direct-template and recipient placeholder constants/regexes. |
| Protocol compatibility | `X-Documenso-*` headers, webhook secret header, existing public API identifiers, `.documenso-*` files. |
| Internal styling/runtime IDs | `documenso-*` Tailwind tokens, `.documenso-branded`, queue/Inngest/Redis IDs, Docker service/image/database names. |
| Upstream operations | Official GitHub, docs, API migration, V1 OpenAPI, telemetry, license-server, Docker image, Enterprise sales/pricing links where they identify the actual vendor service. |
| Licensing UI | Commercial-license names, claim keys/labels, `DOCUMENSO_CLOUD_*`, and tests for those unchanged behaviors. |
| This audit | `docs/customization/instance-branding-plan.md`, because it necessarily names audited values. |

The allowlist must not permit an entire runtime UI/email/PDF directory. Each runtime exception must
name a specific file/pattern and reason so newly introduced user-visible references fail the check.

Text scanning cannot inspect binary images. Add a companion assertion that runtime source no longer
references the known vendor public assets, and manually/snapshot-review the favicon, manifest, base
Open Graph image, share card, default header, email, and PDF outputs.

## Deployment implications

- All brand keys are runtime values. Restart the Remix process after changing them; a rebuild is not
  required for absolute URLs or assets served by an existing public mount/reverse proxy.
- Root-relative asset paths must exist under the deployed base path and be reachable by browsers,
  email rendering, share-card rendering, and PDF rendering. Absolute assets must be reachable from
  both the server and recipients’ email clients.
- Configure long-lived cache headers and immutable/versioned asset URLs. A process-level logo cache
  means an asset URL change or process restart is required to refresh PDF/share rendering.
- Remote asset fetching introduces latency and availability risk. Enforce short timeouts, byte-size
  limits, image content types, and a text fallback. The values are operator-controlled, but the
  loader still must not accept unsafe protocols or credentials.
- `NEXT_PUBLIC_SOURCE_CODE_URL` must point to the exact corresponding modified source made available
  to users. Keep it updated for every deployed commit/release.
- Configure a real SMTP sender, support contact, mailing address where legally required, terms, and
  privacy URLs before enabling a public production signup flow.
- Existing passkeys remain valid because RP ID/origin do not change. Users will only see a new RP
  display name on newly presented registration/authentication prompts.
- Changing email message IDs causes untranslated locales to fall back until translations are
  updated. Treat translation extraction as part of the same implementation change.
- Do not add the public brand keys as Docker build arguments. Add them to Compose/Render runtime
  environment forwarding and Turbo environment tracking only.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Accidental Enterprise bypass | No `packages/ee` changes; no claim/flag writes; retain current entitlement functions; add precedence tests. |
| `hidePoweredBy` misused as rebranding | Instance values are a separate fallback layer; source/license links are independent of the claim. |
| Unsafe logo/link configuration | Shared Zod URL schema, protocol/credential/path checks, output-specific safe resolution, fetch limits. |
| SSR/client mismatch | Both paths use the same module and existing `window.__ENV__` injection; add hydration test. |
| PDF renderer drift | Pass the same resolved config into HTML and Konva paths; test both. |
| Broken base-path assets | Resolve root-relative URLs through `NEXT_PUBLIC_BASE_PATH`; test `/ESign`-style deployment. |
| Email client incompatibility | Recommend PNG logos, absolute URLs in output, bounded dimensions, alt text, and text fallback. |
| Misleading legal/source link | Make source URL production-required and release-specific; keep original copyright/license notices. |
| Upstream merge conflicts | Centralize values, retain current component/export names, avoid internal renames, and keep changes outside `packages/ee`. |
| Translation regression | Interpolate instance names, extract once, compile, and review locale fallback behavior. |

## Upstream-sync strategy

1. Keep `custom-base-v2.17.0` and the vendor backup branch as immutable provenance markers.
2. For each upstream upgrade, merge/rebase onto the selected upstream release in a temporary sync
   branch before moving the implementation branch.
3. Re-run the branding scan against the new upstream tree before resolving conflicts. Treat new
   email templates, layouts, public assets, metadata, PDF renderers, and authentication display
   names as mandatory audit points.
4. Preserve upstream internals (`@documenso/*`, migrations, protocol headers, license/claim logic)
   during conflict resolution.
5. Keep instance-specific behavior behind the shared configuration and shared logo/legal components
   rather than repeating environment reads in new upstream files.
6. Re-run translation extraction, focused unit tests, both PDF paths, signing-branding E2E tests,
   and the explicit-allowlist scan after every sync.
7. Record the new upstream baseline tag and deployed source URL together so the legal page always
   identifies the corresponding source.

## Blocking questions

There are no implementation-blocking questions. Actual brand names, assets, colors, legal URLs,
mailing address, support contacts, and the corresponding-source URL can be supplied as deployment
configuration. Production deployment must not proceed until `NEXT_PUBLIC_SOURCE_CODE_URL` points to
the published source for the modified build.
