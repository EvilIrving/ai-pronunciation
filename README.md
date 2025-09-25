# Words - AI Pronunciation Assistant

Use `/api/speak?word=<term>` to trigger Google Cloud Text-to-Speech, stream the MP3 response, and play it directly in the browser.

## Quick Start

1. pnpm install
2. pnpm dev
3. Visit http://localhost:3000

## Environment Variables

| Key | Description |
| --- | --- |
| NEXT_PUBLIC_SITE_URL | Fully qualified site URL (for example https://words.example.com) used for SEO metadata. |
| GCLOUD_TTS_PROJECT_ID | Google Cloud project ID. |
| GCLOUD_TTS_CREDENTIALS_BASE64 | Base64 encoded Google Cloud service account JSON. |
| GCLOUD_TTS_KEYFILE | Optional path to the Google Cloud service account JSON file if you prefer a file over Base64. |

## Available Scripts

- pnpm dev: start the Next.js dev server.
- pnpm build: create a production build.
- pnpm start: serve the production build.
- pnpm lint: run Biome static analysis.
- pnpm format: apply Biome formatting.

## Features

- Google Cloud Text-to-Speech backed pronunciation playback.
- Instant browser audio with no installation required.
- Enhanced SEO metadata, Open Graph image generation, and structured data.