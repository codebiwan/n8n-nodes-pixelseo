"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PixelSeoApi = void 0;
class PixelSeoApi {
    constructor() {
        this.name = 'pixelSeoApi';
        this.displayName = 'PixelSEO API';
        this.documentationUrl = 'https://pixelseo.ai';
        this.properties = [
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
}
exports.PixelSeoApi = PixelSeoApi;
//# sourceMappingURL=PixelSeoApi.credentials.js.map