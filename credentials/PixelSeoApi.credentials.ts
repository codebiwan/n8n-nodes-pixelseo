import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PixelSeoApi implements ICredentialType {
	name = 'pixelSeoApi';
	displayName = 'PixelSEO API';
	documentationUrl = 'https://pixelseo.ai';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'px_live_...',
			description: 'Your PixelSEO API key from the dashboard under Account → API Keys',
		},
	];
}
