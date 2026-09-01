#!/bin/sh

# 🚀 Starting the configured instance...
INSTANCE_DISPLAY_NAME=${NEXT_PUBLIC_INSTANCE_NAME:-Document Signing}
printf "🚀 Starting %s...\n\n" "$INSTANCE_DISPLAY_NAME"

if [ -z "${NEXT_PUBLIC_SOURCE_CODE_URL:-}" ]; then
    printf "❌ NEXT_PUBLIC_SOURCE_CODE_URL is required so users can access the deployed fork's corresponding source.\n" >&2
    exit 1
fi

# 🔐 Check certificate configuration
printf "🔐 Checking certificate configuration...\n"

CERT_PATH="${NEXT_PRIVATE_SIGNING_LOCAL_FILE_PATH:-/opt/documenso/cert.p12}"

if [ -f "$CERT_PATH" ] && [ -r "$CERT_PATH" ]; then
    printf "✅ Certificate file found and readable - document signing is ready!\n"
else
    printf "⚠️ Certificate not found or not readable\n"
    printf "💡 Tip: %s will still start, but document signing will be unavailable\n" "$INSTANCE_DISPLAY_NAME"
    printf "🔧 Check: http://localhost:3000/api/certificate-status for detailed status\n"
fi

printf "\n📚 Useful Links:\n"
printf "📖 Documentation: https://docs.documenso.com\n"
printf "🐳 Self-hosting guide: https://docs.documenso.com/developers/self-hosting\n"
printf "🔐 Certificate setup: https://docs.documenso.com/developers/self-hosting/signing-certificate\n"
printf "🏥 Health check: http://localhost:3000/api/health\n"
printf "📊 Certificate status: http://localhost:3000/api/certificate-status\n"
printf "👥 Community: https://github.com/documenso/documenso\n\n"

printf "🗄️  Running database migrations...\n"
npx prisma migrate deploy --schema ../../packages/prisma/schema.prisma

printf "🌟 Starting %s server...\n" "$INSTANCE_DISPLAY_NAME"
HOSTNAME=0.0.0.0 node build/server/main.js
