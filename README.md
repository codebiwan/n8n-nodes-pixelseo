# n8n-nodes-pixelseo

This is an n8n community node for [PixelSEO](https://pixelseo.ai) — AI-powered SEO image generation and optimization.

## Operations

- **Generate SEO Image** — Generate AI images using styles or custom prompts, with full SEO metadata (alt text, filename, JSON-LD schema). Optionally return binary data for direct upload to Google Drive, WordPress, S3, and more.
- **Analyze Uploaded Images** — Send existing images and get back SEO-optimized filenames, alt text, and schema markup powered by Claude Vision.
- **SEO Package from URL** — Generate SEO metadata for any publicly accessible image URL.
- **Check Credits** — Check your remaining PixelSEO credit balance.
- **List Styles** — Get all available AI generation styles.

## Installation

In your n8n instance: **Settings → Community Nodes → Install** → search for `n8n-nodes-pixelseo`

## Credentials

You need a PixelSEO API key. Get one from your [PixelSEO dashboard](https://pixelseo.ai/dashboard) under **Account → API Keys**.

Add your API key in n8n under **Credentials → New → PixelSEO API**.

## Usage

### Generate an image and upload to Google Drive

1. Add a **PixelSEO** node → select **Generate SEO Image**
2. Choose a style or write a custom prompt
3. Enable **Return Binary Data**
4. Connect a **Google Drive** upload node

### Bulk SEO metadata for images in a folder

1. **Google Drive** (list files) → **Loop** → **Google Drive** (download file)
2. **PixelSEO** (Analyze Uploaded Images)
3. **Google Sheets** (append row with SEO data)

## Credits

PixelSEO uses a credit system:
- Generate SEO Image: 1 credit
- Analyze Uploaded Images: 1 credit per image
- SEO Package from URL: 0.1 credits

## Output Format Note

Images are generated as PNG by the AI and converted to your chosen format (WebP, JPEG, PNG) via Cloudflare's image transformation. The `image_url` always serves the correct format. Enable **Return Binary Data** to get the actual converted file bytes for piping into upload nodes.

## Links

- [PixelSEO](https://pixelseo.ai)
- [Pricing & Credits](https://pixelseo.ai/pricing)
- [npm package](https://www.npmjs.com/package/n8n-nodes-pixelseo)
