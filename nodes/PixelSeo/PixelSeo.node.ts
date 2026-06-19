import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class PixelSeo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PixelSEO',
		name: 'pixelSeo',
		icon: 'fa:image',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'AI-powered SEO image generation and optimization',
		defaults: { name: 'PixelSEO' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'pixelSeoApi', required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Generate SEO Image',
						value: 'generateImage',
						description: 'Generate an AI-powered SEO image using a style or custom prompt',
						action: 'Generate an SEO image',
					},
					{
						name: 'Analyze Uploaded Images',
						value: 'processImages',
						description: 'Generate SEO metadata (alt text, filename, schema) for uploaded images',
						action: 'Analyze uploaded images',
					},
					{
						name: 'SEO Package from URL',
						value: 'seoPackage',
						description: 'Generate SEO metadata for an existing image URL',
						action: 'Get SEO package from URL',
					},
					{
						name: 'Check Credits',
						value: 'checkCredits',
						description: 'Check your remaining credit balance',
						action: 'Check credit balance',
					},
					{
						name: 'List Styles',
						value: 'listStyles',
						description: 'Get all available generation styles',
						action: 'List available styles',
					},
				],
				default: 'generateImage',
			},

			// ── Generate Image ──────────────────────────────────────────────
			{
				displayName: 'Prompt Mode',
				name: 'promptMode',
				type: 'options',
				options: [
					{ name: 'Style', value: 'style', description: 'Use a predefined style' },
					{ name: 'Custom', value: 'custom', description: 'Use your own prompt' },
					{ name: 'Hybrid', value: 'hybrid', description: 'Combine a style with a custom prompt' },
				],
				default: 'style',
				displayOptions: { show: { operation: ['generateImage'] } },
			},
			{
				displayName: 'Style Slug',
				name: 'styleSlug',
				type: 'string',
				default: '',
				placeholder: 'cinematic-blur',
				description: 'Style slug from the List Styles operation',
				displayOptions: { show: { operation: ['generateImage'], promptMode: ['style', 'hybrid'] } },
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				placeholder: 'coffee shop interior',
				description: 'The subject of the image',
				displayOptions: { show: { operation: ['generateImage'] } },
			},
			{
				displayName: 'Custom Prompt',
				name: 'customPrompt',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'Your custom image generation prompt',
				displayOptions: { show: { operation: ['generateImage'], promptMode: ['custom', 'hybrid'] } },
			},
			{
				displayName: 'Orientation',
				name: 'orientation',
				type: 'options',
				options: [
					{ name: 'Landscape', value: 'landscape' },
					{ name: 'Portrait', value: 'portrait' },
					{ name: 'Square', value: 'square' },
				],
				default: 'landscape',
				displayOptions: { show: { operation: ['generateImage'] } },
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{ name: 'WebP', value: 'webp' },
					{ name: 'JPEG', value: 'jpeg' },
					{ name: 'PNG', value: 'png' },
				],
				default: 'webp',
				description: 'Images are generated as PNG by AI and converted to your chosen format via Cloudflare. The returned image_url will serve the correct format. Enable "Return Binary Data" below to get the actual converted file for uploading to Google Drive, WordPress, S3, etc.',
				displayOptions: { show: { operation: ['generateImage', 'seoPackage'] } },
			},
			{
				displayName: 'Return Binary Data',
				name: 'returnBinary',
				type: 'boolean',
				default: false,
				description: 'Whether to fetch and return the image as binary data, enabling direct upload to Google Drive, WordPress, S3, email attachments, and other nodes',
				displayOptions: { show: { operation: ['generateImage'] } },
			},
			{
				displayName: 'Binary Property Name',
				name: 'binaryOutputProperty',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property to store the image in',
				displayOptions: { show: { operation: ['generateImage'], returnBinary: [true] } },
			},

			// ── Process Images ──────────────────────────────────────────────
			{
				displayName: 'Binary Property',
				name: 'binaryProperty',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property containing the image to analyze',
				displayOptions: { show: { operation: ['processImages'] } },
			},
			{
				displayName: 'Site URL',
				name: 'siteUrl',
				type: 'string',
				default: '',
				placeholder: 'https://example.com',
				description: 'Your site URL for SEO context',
				displayOptions: { show: { operation: ['processImages'] } },
			},

			// ── SEO Package ─────────────────────────────────────────────────
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/image.jpg',
				required: true,
				displayOptions: { show: { operation: ['seoPackage'] } },
			},
			{
				displayName: 'Style Slug',
				name: 'styleSlugSeo',
				type: 'string',
				default: '',
				placeholder: 'cinematic-blur',
				description: 'Optional style for additional context',
				displayOptions: { show: { operation: ['seoPackage'] } },
			},
			{
				displayName: 'Context',
				name: 'context',
				type: 'string',
				typeOptions: { rows: 2 },
				default: '',
				description: 'Additional context to improve SEO output',
				displayOptions: { show: { operation: ['seoPackage'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('pixelSeoApi');
		const apiKey = credentials.apiKey as string;
		const baseUrl = 'https://pixelseo.ai/api/v1';
		const authHeader = { 'X-API-Key': apiKey };

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				let responseData: unknown;

				if (operation === 'generateImage') {
					const promptMode = this.getNodeParameter('promptMode', i) as string;
					const body: Record<string, unknown> = { prompt_mode: promptMode };

					if (promptMode === 'style' || promptMode === 'hybrid') {
						body.style_slug = this.getNodeParameter('styleSlug', i);
					}
					if (promptMode === 'custom' || promptMode === 'hybrid') {
						body.custom_prompt = this.getNodeParameter('customPrompt', i);
					}

					const subject = this.getNodeParameter('subject', i) as string;
					if (subject) body.subject = subject;
					body.orientation = this.getNodeParameter('orientation', i);
					body.output_format = this.getNodeParameter('outputFormat', i);

					responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/generate`,
						headers: { ...authHeader, 'Content-Type': 'application/json' },
						body,
						json: true,
					});

					const returnBinary = this.getNodeParameter('returnBinary', i) as boolean;
					if (returnBinary) {
						const res = responseData as Record<string, unknown>;
						const imageUrl = res.image_url as string;
						const outputFormat = this.getNodeParameter('outputFormat', i) as string;
						const binaryOutputProperty = this.getNodeParameter('binaryOutputProperty', i) as string;
						const mimeMap: Record<string, string> = { webp: 'image/webp', jpeg: 'image/jpeg', png: 'image/png' };

						const imageBuffer = await this.helpers.httpRequest({
							method: 'GET',
							url: imageUrl,
							encoding: 'arraybuffer',
							returnFullResponse: false,
						});

						const binaryData = await this.helpers.prepareBinaryData(
							Buffer.from(imageBuffer as ArrayBuffer),
							res.filename as string ?? `image.${outputFormat}`,
							mimeMap[outputFormat] ?? 'image/webp',
						);

						returnData.push({
							json: res as never,
							binary: { [binaryOutputProperty]: binaryData },
							pairedItem: i,
						});
						continue;
					}

				} else if (operation === 'processImages') {
					const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
					const siteUrl = this.getNodeParameter('siteUrl', i) as string;
					const binaryData = this.helpers.assertBinaryData(i, binaryProperty);
					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);

					const formData = new FormData();
					const blob = new Blob([buffer], { type: binaryData.mimeType });
					formData.append('images', blob, binaryData.fileName ?? 'image.jpg');
					if (siteUrl) formData.append('site_url', siteUrl);

					responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/process-images`,
						headers: authHeader,
						body: formData,
					});

				} else if (operation === 'seoPackage') {
					const body: Record<string, unknown> = {
						image_url: this.getNodeParameter('imageUrl', i),
						output_format: this.getNodeParameter('outputFormat', i),
					};
					const styleSlug = this.getNodeParameter('styleSlugSeo', i) as string;
					const context = this.getNodeParameter('context', i) as string;
					if (styleSlug) body.style_slug = styleSlug;
					if (context) body.context = context;

					responseData = await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}/seo-package`,
						headers: { ...authHeader, 'Content-Type': 'application/json' },
						body,
						json: true,
					});

				} else if (operation === 'checkCredits') {
					responseData = await this.helpers.httpRequest({
						method: 'GET',
						url: `${baseUrl}/account/credits`,
						headers: authHeader,
					});

				} else if (operation === 'listStyles') {
					responseData = await this.helpers.httpRequest({
						method: 'GET',
						url: `${baseUrl}/styles`,
						headers: authHeader,
					});
				}

				returnData.push({ json: responseData as never, pairedItem: i });

			} catch (error: unknown) {
				const httpError = error as { response?: { status?: number }; message?: string };

				if (httpError.response?.status === 402) {
					throw new NodeOperationError(
						this.getNode(),
						'Insufficient credits. Purchase more at pixelseo.ai.',
						{ itemIndex: i },
					);
				}
				if (httpError.response?.status === 429) {
					throw new NodeOperationError(
						this.getNode(),
						'Rate limit exceeded. Maximum 10 generations per minute.',
						{ itemIndex: i },
					);
				}
				if (this.continueOnFail()) {
					returnData.push({ json: { error: httpError.message ?? 'Unknown error' }, pairedItem: i });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
