import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';
import { getInstanceBranding, resolveInstanceBrandingUrl } from '@documenso/lib/constants/instance-branding';
import { getRecipientOrSenderByShareLinkSlug } from '@documenso/lib/server-only/document/get-recipient-or-sender-by-share-link-slug';
import { svgToPng } from '@documenso/lib/utils/images/svg-to-png';
import satori from 'satori';
import { match, P } from 'ts-pattern';

import type { Route } from './+types/share.$slug.opengraph';

export const runtime = 'edge';

const CARD_OFFSET_TOP = 173;
const CARD_OFFSET_LEFT = 307;
const CARD_WIDTH = 590;
const CARD_HEIGHT = 337;

const IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { slug } = params;
  const branding = getInstanceBranding();
  const logoUrl = resolveInstanceBrandingUrl(branding.logoUrl, { absolute: true });

  // QR codes are not supported for OpenGraph images
  if (slug.startsWith('qr_')) {
    return new Response('Not found', { status: 404 });
  }

  const baseUrl = NEXT_PUBLIC_WEBAPP_URL();

  const [interSemiBold, interRegular, caveatRegular] = await Promise.all([
    fetch(new URL(`${baseUrl}/fonts/inter-semibold.ttf`, import.meta.url)).then(async (res) => res.arrayBuffer()),
    fetch(new URL(`${baseUrl}/fonts/inter-regular.ttf`, import.meta.url)).then(async (res) => res.arrayBuffer()),
    fetch(new URL(`${baseUrl}/fonts/caveat-regular.ttf`, import.meta.url)).then(async (res) => res.arrayBuffer()),
  ]);

  const recipientOrSender = await getRecipientOrSenderByShareLinkSlug({
    slug,
  });

  if ('error' in recipientOrSender) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const isRecipient = 'Signature' in recipientOrSender;

  const signatureImage = match(recipientOrSender)
    .with({ signatures: P.array(P._) }, (recipient) => {
      return recipient.signatures?.[0]?.signatureImageAsBase64 || null;
    })
    .otherwise((sender) => {
      return sender.signature || null;
    });

  const signatureName = match(recipientOrSender)
    .with({ signatures: P.array(P._) }, (recipient) => {
      return recipient.name || recipient.email;
    })
    .otherwise((sender) => {
      return sender.name || sender.email;
    });

  // Generate SVG using Satori
  const svg = await satori(
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        backgroundColor: '#f8fafc',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 48,
          right: 56,
          display: 'flex',
          alignItems: 'center',
          color: '#0f172a',
          fontFamily: 'Inter',
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={branding.name} style={{ maxWidth: 280, maxHeight: 48, objectFit: 'contain' }} />
        ) : (
          branding.name
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: CARD_OFFSET_TOP,
          left: CARD_OFFSET_LEFT,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          border: `3px solid ${branding.primaryColor}`,
          borderRadius: 24,
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
        }}
      />

      {signatureImage ? (
        <div
          style={{
            position: 'absolute',
            padding: '24px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            top: CARD_OFFSET_TOP,
            left: CARD_OFFSET_LEFT,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          }}
        >
          <img
            src={signatureImage}
            alt="signature"
            style={{
              opacity: 0.6,
              height: '100%',
              maxWidth: '100%',
            }}
          />
        </div>
      ) : (
        <p
          style={{
            position: 'absolute',
            padding: '24px 48px',
            marginTop: '-8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#64748b',
            fontFamily: 'Caveat',
            fontSize: Math.max(Math.min((CARD_WIDTH * 1.5) / signatureName.length, 80), 36),
            top: CARD_OFFSET_TOP,
            left: CARD_OFFSET_LEFT,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          }}
        >
          {signatureName}
        </p>
      )}

      <div
        style={{
          position: 'absolute',
          display: 'flex',
          width: '100%',
          top: CARD_OFFSET_TOP - 78,
          left: CARD_OFFSET_LEFT,
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            color: '#828282',
            fontFamily: 'Inter',
            fontWeight: 700,
          }}
        >
          {isRecipient ? 'Document Signed!' : 'Document Sent!'}
        </h2>
      </div>
    </div>,
    {
      width: IMAGE_SIZE.width,
      height: IMAGE_SIZE.height,
      fonts: [
        {
          name: 'Caveat',
          data: caveatRegular,
          style: 'italic',
        },
        {
          name: 'Inter',
          data: interRegular,
          weight: 400,
        },
        {
          name: 'Inter',
          data: interSemiBold,
          weight: 600,
        },
      ],
    },
  );

  const pngBuffer = await svgToPng(svg.toString());

  return new Response(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': pngBuffer.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
};
