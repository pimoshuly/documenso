# Custom CE Fork Deployment

This runbook deploys the Community Edition instance-branding fork without changing Documenso's
license or Enterprise Edition feature boundaries. It assumes the release commit is on
`custom/instance-branding`, is descended from the pinned v2.17.0 baseline
`75330166cc00b29c14399bc2e391e4b4d8080c00`, and has been pushed to the public fork before the
application is made available to users.

## Release gate

Do not deploy until all of the following are true:

- The release commit and every deployed modification are publicly available from the URL configured
  in `NEXT_PUBLIC_SOURCE_CODE_URL`.
- `main` and `custom-base-v2.17.0` still identify the pinned vendor baseline, and the release is built
  from `custom/instance-branding`.
- `npm ci`, the branding tests, Remix typecheck, email preview build, full production build, and
  Docker build pass from a clean lockfile install.
- `/api/health` reports a working database and `/api/certificate-status` reports a usable signing
  certificate.
- A backup and restore rehearsal has been completed for the database, document storage, and signing
  certificate.

The current fork URL is `https://github.com/pimoshuly/documenso`. For a branch deployment, use
`https://github.com/pimoshuly/documenso/tree/custom/instance-branding` only after that branch exists
on GitHub. Prefer a commit URL for an immutable production release.

For `docker/production/compose.yml`, set the host-side `DOCUMENSO_IMAGE` variable to an image built
from that same commit. The custom compose file has no upstream-image fallback, preventing an
accidental deployment that omits the fork's modifications.

## Required runtime configuration

Brand values are public by design: Remix injects `NEXT_PUBLIC_*` values into `window.__ENV__` so one
container image can be branded at runtime. Never put credentials, database URLs, SMTP passwords,
private keys, certificate contents, or other secrets in these variables.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_WEBAPP_URL` | Yes | Canonical external origin, including any base path. |
| `NEXT_PUBLIC_SOURCE_CODE_URL` | Production | Public corresponding source for the exact deployed modifications. The production entrypoint fails when missing. |
| `NEXTAUTH_SECRET` | Yes | Random authentication/session secret. |
| `NEXT_PRIVATE_ENCRYPTION_KEY` | Yes | Random primary encryption key of at least 32 characters. |
| `NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY` | Yes | Independent secondary encryption key of at least 32 characters. |
| `NEXT_PRIVATE_DATABASE_URL` | Yes | PostgreSQL application connection. |
| `NEXT_PRIVATE_DIRECT_DATABASE_URL` | With pooling | Direct PostgreSQL connection used for migrations. |
| `NEXT_PRIVATE_SMTP_TRANSPORT` | Yes for email | Outbound transport, normally `smtp-auth`. |
| `NEXT_PRIVATE_SMTP_FROM_NAME` | Yes for email | Sender display name; set it to the instance operator's identity. |
| `NEXT_PRIVATE_SMTP_FROM_ADDRESS` | Yes for email | Verified sender address. |
| `NEXT_PRIVATE_SMTP_HOST` / `PORT` / `USERNAME` / `PASSWORD` | For SMTP auth | Provider connection details; keep them in the platform secret store. |
| `NEXT_PRIVATE_SIGNING_TRANSPORT` | Yes for signing | Use `local` for the CE-compatible local certificate path. |
| `NEXT_PRIVATE_SIGNING_LOCAL_FILE_PATH` or `NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS` | Yes for signing | PKCS#12 certificate location or base64 content. |
| `NEXT_PRIVATE_SIGNING_PASSPHRASE` | Yes for local signing | PKCS#12 passphrase, stored as a secret. |
| `NEXT_PUBLIC_UPLOAD_TRANSPORT` | Yes | `database` or a configured supported object store. |

Generate production secrets with a cryptographically secure generator. Do not copy values from
`.env.example`, local validation, CI logs, or another environment.

## Instance-brand variables

Unsafe URL schemes are rejected. URL fields accept only absolute `http:`/`https:` URLs or
root-relative application asset paths. Optional invalid or blank values are omitted and never fall
back to Documenso marketing or corporate identity.

| Variable | Default when blank | Use |
| --- | --- | --- |
| `NEXT_PUBLIC_INSTANCE_NAME` | `Document Signing` | App, email, PDF, OpenAPI, WebAuthn, and authenticator display name. |
| `NEXT_PUBLIC_INSTANCE_SHORT_NAME` | Instance name | Short PWA/manifest name. |
| `NEXT_PUBLIC_INSTANCE_DESCRIPTION` | `Securely send and sign documents.` | Page, manifest, and Open Graph description. |
| `NEXT_PUBLIC_INSTANCE_WEBSITE_URL` | Omitted | Optional public website and email footer link. |
| `NEXT_PUBLIC_INSTANCE_LOGO_URL` | Text app-name fallback | Horizontal logo or wordmark. |
| `NEXT_PUBLIC_INSTANCE_ICON_URL` | Neutral built-in document icon on web | Favicon and manifest icon. |
| `NEXT_PUBLIC_INSTANCE_OPENGRAPH_IMAGE_URL` | Omitted | Optional general social preview image. |
| `NEXT_PUBLIC_INSTANCE_PRIMARY_COLOR` | `#334155` | UI, email, manifest, and share-card primary color. |
| `NEXT_PUBLIC_INSTANCE_PRIMARY_FOREGROUND_COLOR` | `#ffffff` | Foreground color used on the primary color. |
| `NEXT_PUBLIC_INSTANCE_LEGAL_NAME` | Omitted | Optional operator name in legal and email output. |
| `NEXT_PUBLIC_INSTANCE_LEGAL_ADDRESS` | Omitted | Optional public postal address in email output. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Omitted | Public support contact and optional mail link. |
| `NEXT_PUBLIC_INSTANCE_EMAIL_FOOTER_TEXT` | Omitted | Optional plain-text transactional-email footer note. |
| `NEXT_PUBLIC_SOURCE_CODE_URL` | No production fallback | Public corresponding-source link. |
| `NEXT_PUBLIC_INSTANCE_DOCUMENTATION_URL` | Omitted | Instance-owned documentation destination. |
| `NEXT_PUBLIC_INSTANCE_SUPPORT_URL` | Omitted | Instance-owned support destination. |
| `NEXT_PUBLIC_INSTANCE_TERMS_URL` | Omitted | Terms link; configure before enabling public signup when required. |
| `NEXT_PUBLIC_INSTANCE_PRIVACY_URL` | Omitted | Privacy link; configure before enabling public signup when required. |
| `NEXT_PUBLIC_INSTANCE_PLANS_URL` | Omitted | Optional plans/pricing link in eligible email content. |

Changing these values does not enable organisation/team branding, white-label claims,
`hidePoweredBy`, or any Enterprise Edition feature.

## Brand assets

Place version-controlled local assets under `apps/remix/public/static/brand/` before building the
image, or use a stable public HTTPS URL. See `apps/remix/public/static/brand/README.md` for format and
dimension guidance.

Recommended local slots are:

- `/static/brand/logo.svg` for a horizontal wordmark;
- `/static/brand/icon.svg` or a square PNG for favicon/PWA use;
- `/static/brand/opengraph.png` for social previews.

Use root-relative values for local files. Email and PDF rendering resolve local logo paths against
`NEXT_PUBLIC_WEBAPP_URL`, so that URL must be reachable by email clients and by the running server.
Keep asset URLs stable for the lifetime of emails and signed records. A missing logo intentionally
renders the configured app name as text; do not replace the neutral bundled icon with a customer
logo unless the customer supplied it.

## Railway deployment

Create the Railway service from `pimoshuly/documenso`, explicitly select
`custom/instance-branding`, and use `docker/Dockerfile`. Do not use the upstream one-click template
or the upstream `documenso/documenso:latest` image for this fork because neither contains these
modifications.

Attach a new Railway PostgreSQL service and reference its connection string without copying it into
the repository:

```text
NEXT_PRIVATE_DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXT_PRIVATE_DIRECT_DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Configure every secret in Railway's Variables UI. Set `NEXT_PUBLIC_WEBAPP_URL` to the final HTTPS
domain and set `NEXT_PUBLIC_SOURCE_CODE_URL` to the public branch or immutable commit that Railway
actually builds. Mount the local `.p12` securely or use base64 certificate contents in a secret;
never commit the certificate. The production start command runs Prisma migrations before starting
the server, so take a database backup and review migrations before each rollout.

Set Railway's health-check path to `/api/health`. After each deployment, verify both endpoints:

```bash
curl --fail-with-body https://sign.example.com/api/health
curl --fail-with-body https://sign.example.com/api/certificate-status
```

The first endpoint covers application/database health and includes certificate state. The second is
the detailed signing readiness check. Treat a missing or unusable certificate as a failed signing
release even if the web process is reachable.

## Backup and restore

Back up all three data classes on an operator-defined schedule:

1. PostgreSQL, including document blobs when `NEXT_PUBLIC_UPLOAD_TRANSPORT=database`.
2. The object-storage bucket and its versions when using external storage.
3. The PKCS#12 certificate and passphrase, encrypted and stored separately from the database backup.

Use `pg_dump -F c` for a portable PostgreSQL backup. Restore into a separate database with
`pg_restore`, point a non-production instance at it, and verify users, documents, signatures, audit
logs, and downloads before declaring the backup usable. Test object-store recovery separately. A
lost certificate prevents new digital signatures; a leaked certificate or passphrase requires
immediate replacement and incident response.

Never test restore procedures by resetting the production database. Record backup timestamps,
checksums, retention, encryption, and the exact application commit needed to read each backup.

## Upstream updates

Keep the vendor baseline and custom implementation separate:

1. Fetch `origin` and `upstream` with tags, without pruning.
2. Verify the intended signed/tagged upstream release commit.
3. Create a new backup branch for the current custom release before integration.
4. Rebase or merge the custom branch onto the reviewed upstream release in a temporary integration
   branch; never force-reset deployed custom work.
5. Resolve conflicts in the central brand resolver and surface adapters without renaming
   `@documenso/*`, Prisma/migration identifiers, integration headers, or legal notices.
6. Re-run the complete release gate, CE/license audit, vendor-reference scan, isolated-database
   smoke tests, and backup/restore rehearsal.
7. Push the reviewed release commit, update `NEXT_PUBLIC_SOURCE_CODE_URL` to that exact public source,
   then deploy the same commit digest.

Do not copy or enable `packages/ee` behavior during an upstream sync. Preserve the root AGPL-3.0
license, upstream copyright notices, `packages/ee/LICENSE`, `packages/ee/FEATURES`, and all existing
feature/claim checks.

## Vendor-reference allowlist

The final case-insensitive scan may retain vendor strings only in these categories:

| Category | Allowed examples |
| --- | --- |
| Legal and copyright | Root `LICENSE`, `packages/ee/LICENSE`, copyright headers, the in-app license article identifying Documenso as the upstream work. |
| Licensing documentation | `packages/ee/FEATURES`, policy text, claim descriptions, and tests of existing license behavior. |
| Internal compatibility identifiers | `@documenso/*`, workspace package names, `X-Documenso-*`, `.documenso-*`, `DOCUMENSO_*`, CSS tokens/classes, persisted placeholder addresses, job/Redis/telemetry identifiers. |
| Migration history | Prisma migrations, historical data values, and migration-only scripts. |
| Upstream maintenance documentation | README, contributor docs, upstream API migration/help links, Docker image references, repository remotes, telemetry disclosure, and release notes. |
| Negative regression tests | Assertions and fixtures that intentionally verify vendor strings are absent from rendered output. |

Any match in runtime UI, metadata, email, PDF/certificate output, public assets, preview fixtures, or
sender defaults that does not fit one of these categories blocks deployment and must be investigated.
